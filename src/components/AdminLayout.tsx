import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';
import { logout } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const storeSettings = useAppStore(state => state.storeSettings);
  const user = useAppStore(state => state.user);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-700 text-white flex flex-col flex-shrink-0 shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-emerald-600/50">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
             {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
             ) : (
                <span className="text-emerald-700 font-black text-xl italic">
                  {storeSettings?.name ? storeSettings.name.charAt(0).toUpperCase() : 'T'}
                </span>
             )}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight truncate">{storeSettings?.name || 'TokoKita'}</h1>
            <p className="text-xs text-emerald-200 opacity-80 truncate">Admin Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-600 font-semibold text-white'
                        : 'text-emerald-100 hover:bg-emerald-600/50 opacity-90 hover:opacity-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-emerald-600/50 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-emerald-800/50 rounded-xl mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="truncate">
              <p className="font-medium truncate text-xs">{user?.name || 'Admin Utama'}</p>
              <p className="text-[10px] text-emerald-300 truncate">{user?.email || 'admin@tokokita.id'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 text-emerald-100 hover:bg-red-500/20 hover:text-red-100 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800">Dashboard Real-time</h2>
            <p className="text-slate-400 text-xs">Pantau transaksi dan produk Anda di sini.</p>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 relative flex flex-col">
          <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
