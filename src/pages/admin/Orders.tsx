import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

export default function Orders() {
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

  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updatedAt: Date.now() 
      };
      
      if (trackingNumber !== undefined) {
        updateData.trackingNumber = trackingNumber;
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  if (loading) return <div>Memuat pesanan...</div>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pesanan</h2>
          <p className="text-xs text-slate-400 mt-1">Pantau dan kelola pesanan pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-[11px] uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">ID Pesanan</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Rincian Barang</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Nomor Resi</th>
                <th className="px-6 py-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                let itemsList: any[] = [];
                try { itemsList = JSON.parse(order.items); } catch(e) {}
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{order.userName}</div>
                    </td>
                    <td className="px-6 py-4">
                       <ul className="list-disc pl-4 text-xs text-slate-500 font-medium whitespace-normal max-w-[200px]">
                          {itemsList.map((item, i) => (
                            <li key={i}>{item.name} <span className="font-bold text-slate-700">({item.quantity}x)</span></li>
                          ))}
                       </ul>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`text-[10px] uppercase tracking-wide font-bold rounded-md px-2.5 py-1.5 border-0 focus:ring-2 appearance-none cursor-pointer outline-none transition-colors
                          ${order.status === 'pending' ? 'bg-orange-100 text-orange-600 focus:ring-orange-500 hover:bg-orange-200' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-600 focus:ring-blue-500 hover:bg-blue-200' :
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-600 focus:ring-indigo-500 hover:bg-indigo-200' :
                            'bg-emerald-100 text-emerald-700 focus:ring-emerald-500 hover:bg-emerald-200'
                          }
                        `}
                      >
                        <option value="pending">Belum Diproses</option>
                        <option value="processing">Sedang Diproses</option>
                        <option value="shipped">Dalam Pengiriman</option>
                        <option value="delivered">Terkirim</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        placeholder="Input resi..."
                        defaultValue={order.trackingNumber || ''}
                        onBlur={(e) => {
                          if (e.target.value !== order.trackingNumber) {
                             handleUpdateStatus(order.id, order.status, e.target.value);
                          }
                        }}
                        className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg w-32 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 transition shadow-inner"
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric'})}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">Belum ada pesanan masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
