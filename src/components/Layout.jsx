import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/parents', icon: 'family_restroom', label: 'Parents' },
    { path: '/students', icon: 'school', label: 'Students' },
    { path: '/academic-years', icon: 'calendar_today', label: 'Academic Years' },
    { path: '/fee-structures', icon: 'payments', label: 'Fee Structures' },
    { path: '/fee-payment', icon: 'receipt_long', label: 'Pay Fee' },
    { path: '/parent-fee-bill', icon: 'request_quote', label: 'Generate Fee Bill' },
    { path: '/student-fee-details', icon: 'person_search', label: 'Student Fee Details' },
    { path: '/fee-ledger', icon: 'account_balance_wallet', label: 'Fee Ledger' },
    ...(canManageUsers ? [
      { path: '/activity-log', icon: 'history', label: 'Activity Log' },
      { path: '/users', icon: 'group', label: 'Users List' }
    ] : []),
    { path: '/profile', icon: 'account_circle', label: 'Profile' },
  ];

  return (
    <div className="text-[var(--color-text)] font-sans antialiased flex h-screen overflow-hidden bg-[var(--color-background)] print:h-auto print:overflow-visible">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] transition-all duration-300 bg-[var(--color-primary)] shadow-md flex flex-col z-20 print:hidden">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">Pen & Page Academia</h1>
          <p className="text-[var(--color-accent)] text-sm mt-1">School Management</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 py-3 px-6 cursor-pointer active:scale-95 transition-colors ${
                    isActive(item.path)
                      ? 'bg-[var(--color-secondary)] border-l-4 border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'text-gray-300 hover:text-white hover:bg-[var(--color-secondary)]'
                  }`}
                >
                  <span className="material-symbols-outlined" style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-[var(--color-secondary)]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 text-gray-300 hover:text-white py-3 px-6 cursor-pointer active:scale-95 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-[260px] print:ml-0 flex flex-col h-screen print:h-auto overflow-hidden print:overflow-visible">
        {/* TopNavBar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] w-64 transition-all"
                placeholder="Search..."
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 transition-colors rounded-full active:opacity-80">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link to="/profile" className="p-2 text-gray-500 hover:bg-gray-100 transition-colors rounded-full active:opacity-80 flex items-center justify-center">
                <span className="material-symbols-outlined">settings</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden md:block">
                <p className="font-bold text-[10px] tracking-wider text-[var(--color-primary)] uppercase">{user?.role}</p>
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              </div>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto print:overflow-visible p-6 lg:p-8 max-w-[1440px] print:max-w-none print:p-0 mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
