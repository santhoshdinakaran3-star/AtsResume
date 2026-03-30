import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1rem',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20L4 18H20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5" cy="6" r="2" fill="white"/>
              <circle cx="19" cy="6" r="2" fill="white"/>
              <circle cx="5" cy="18" r="2" fill="white"/>
              <circle cx="19" cy="18" r="2" fill="white"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}>
            Zentix
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
               <Link
                key={to}
                to={to}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-all"
                style={{
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#059669' : '#6B7280',
                  background: isActive ? '#ECFDF5' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
