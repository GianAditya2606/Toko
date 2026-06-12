import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(doc => {
        ords.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ords);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  // Get today's begin time
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => o.createdAt >= startOfDay.getTime());
  const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  if (loading) return <div className="text-slate-500">Memuat data dashboard...</div>;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Pendapatan Hari Ini</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-slate-800">{formatPrice(todaySales)}</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Pesanan Hari Ini</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-slate-800">{todayOrders.length}</span>
            <span className="text-emerald-500 text-xs font-bold mb-1">Pesanan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Total Pendapatan</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-slate-800">{formatPrice(totalSales)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Total Pesanan</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-slate-800">{totalOrders}</span>
            <span className="text-emerald-500 text-xs font-bold mb-1">Keseluruhan</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Pesanan Hari Ini</h3>
          <span className="text-xs text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-full">Firestore Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                <th className="px-6 py-3">ID Pesanan</th>
                <th className="px-6 py-3">Pelanggan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{order.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{order.userName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md
                      ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                        order.status === 'shipped' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-emerald-100 text-emerald-800'
                      }
                    `}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{formatPrice(order.totalAmount)}</td>
                  <td className="px-6 py-4 text-right text-slate-500 text-xs font-semibold">
                    {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {todayOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">Belum ada pesanan masuk hari ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
