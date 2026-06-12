import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Plus, Minus, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { loginWithGoogle, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { cart, removeFromCart, updateCartQuantity, clearCart, user, storeSettings } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleCheckout = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    if (cart.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const orderData = {
        userId: user.id,
        userName: user.name,
        items: JSON.stringify(cart),
        totalAmount: total,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear local cart
      clearCart();
      
      // Redirect to WhatsApp
      const waNumber = storeSettings?.phoneNumber || '6281234567890';
      const cleanWa = waNumber.replace(/[^0-9]/g, '');
      
      let cartText = '';
      cart.forEach((item, i) => {
        cartText += `${i + 1}. ${item.name} (${item.quantity}x) = ${formatPrice(item.price * item.quantity)}\n`;
      });
      
      const message = `Halo, saya ingin memesan:\n\n*ID Pesanan*: ${docRef.id}\n*Nama*: ${user.name}\n\n*Pesanan*:\n${cartText}\n*Total*: ${formatPrice(total)}\n\nMohon informasi pembayarannya.`;
      
      const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      
      onClose();
    } catch (e) {
       console.error("Checkout failed", e);
       try { handleFirestoreError(e, OperationType.CREATE, 'orders'); } catch (err) {}
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center sm:justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
      />
      
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full sm:h-screen bg-white shadow-2xl flex flex-col border-l border-slate-100"
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Keranjang Belanja</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 text-slate-200" />
              <p className="font-medium text-sm">Keranjang masih kosong.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-slate-100"></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="font-bold text-slate-800 line-clamp-2 text-sm leading-snug">{item.name}</h3>
                      <p className="text-emerald-600 font-bold mt-1 text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-row justify-between items-center mt-2">
                       <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 shadow-sm">
                          <button 
                            onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-200 rounded-md transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                            disabled={item.quantity >= item.stock}
                            className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-200 rounded-md transition disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 p-1.5 ml-4 rounded-md hover:bg-red-50 transition">
                          <Trash2 className="w-4 h-4"/>
                       </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-bold text-sm tracking-wide uppercase">Total</span>
              <span className="text-2xl font-black text-slate-800">{formatPrice(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-emerald-500 text-white flex justify-center items-center gap-3 py-4 rounded-xl font-bold hover:bg-emerald-600 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {isProcessing ? 'Memproses...' : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  {user ? 'Pesan via WhatsApp' : 'Masuk Google untuk Memesan'}
                </>
              )}
            </button>
            {!user && (
              <p className="text-[10px] uppercase tracking-wider font-bold text-center text-slate-400 mt-4">Login dengan akun Google untuk melanjutkan</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
