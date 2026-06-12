import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useAppStore } from '../store/useAppStore';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const addToCart = useAppStore(state => state.addToCart);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleAdd = () => {
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            No Image
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-[32px] font-medium leading-relaxed">
          {product.description}
        </p>
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-50">
          <span className="text-xl font-black text-slate-800 tracking-tight">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 ${
              product.stock > 0 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm' 
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title={product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
