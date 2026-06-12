import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAppStore } from '../../store/useAppStore';
import { StoreSettings } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';

export default function Settings() {
  const storeSettings = useAppStore(state => state.storeSettings);
  const setStoreSettings = useAppStore(state => state.setStoreSettings);
  
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    phoneNumber: '',
    address: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (storeSettings) {
      setFormData({
        name: storeSettings.name,
        logoUrl: storeSettings.logoUrl,
        phoneNumber: storeSettings.phoneNumber,
        address: storeSettings.address
      });
    }
  }, [storeSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const docRef = doc(db, 'store_settings', 'info');
      const docSnap = await getDoc(docRef);
      
      const newSettings = {
        ...formData,
        updatedAt: Date.now()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, newSettings);
      } else {
        await setDoc(docRef, newSettings);
      }
      
      setStoreSettings(newSettings as StoreSettings);
      setMessage('Pengaturan berhasil disimpan!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'store_settings/info');
      setMessage('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-2xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengaturan Toko</h2>
          <p className="text-xs text-slate-400 mt-1">Konfigurasi nama, nomor WhatsApp, dan logo.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 block">Nama Toko</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              placeholder="Contoh: Toko Maju Jaya"
            />
          </div>
          
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 block">URL Logo Toko</label>
            <input 
              type="url" required
              value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              placeholder="https://example.com/logo.png"
            />
            {formData.logoUrl && (
               <div className="mt-4 flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                 <img src={formData.logoUrl} alt="Logo Preview" className="h-14 w-14 rounded-xl border border-slate-200 object-cover shadow-sm bg-white" />
                 <p className="text-xs text-slate-400 font-medium">Preview Logo Toko</p>
               </div>
            )}
          </div>
          
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 block">Nomor WhatsApp Notif</label>
            <p className="text-xs text-slate-400 font-medium mb-3">Nomor ini digunakan untuk menerima pesanan baru secara otomatis.</p>
            <input 
              type="text" required
              value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium font-mono"
              placeholder="0812-3456-7890"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1.5 block">Alamat Toko</label>
            <textarea 
              required rows={3}
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
              placeholder="Alamat lengkap toko fisik (jika ada)..."
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-8">
            <span className={`text-[11px] uppercase tracking-widest font-bold ${message.includes('berhasil') ? 'text-emerald-500' : 'text-red-500'}`}>
              {message}
            </span>
            <button 
              type="submit" 
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-black disabled:opacity-70 disabled:hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
