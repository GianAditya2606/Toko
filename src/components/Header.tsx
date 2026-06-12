import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { loginWithGoogle, logout } from '../lib/firebase';
import CartModal from './CartModal';

export default function Header() {
  const { user, isAdmin, cart, storeSettings } = useAppStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3">
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800 tracking-tight leading-tight">
                  {storeSettings?.name || 'TokoKita'}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-slate-500 hover:text-emerald-600 transition-colors rounded-xl hover:bg-slate-100"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 translate-y-1/4 bg-orange-500 rounded-full shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <Link to="/admin" className="text-xs font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex justify-center items-center text-emerald-700 font-bold overflow-hidden shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md active:scale-95 text-sm"
                >
                  <User className="w-4 h-4" />
                  Masuk via Google
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <AnimatePresence>
        {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
