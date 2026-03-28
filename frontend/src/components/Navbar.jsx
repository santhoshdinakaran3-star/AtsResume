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
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.85rem',
          }}>
            A
          </div>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}>
            ATS AI
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
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
