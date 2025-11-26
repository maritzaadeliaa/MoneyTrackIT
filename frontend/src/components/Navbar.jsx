// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          padding: "12px 16px",
          background: "#1f2937",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1000,
        }}
      >
        {/* kiri: logo / judul */}
        <div className="navbar-logo">
          MoneyTrack
        </div>

        {/* tengah: menu navigasi - desktop */}
        <nav className="navbar-nav-desktop">
          <Link 
            to="/" 
            className="nav-link"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/transactions"
            className="nav-link"
            onClick={closeMenu}
          >
            Transaksi
          </Link>
          <Link
            to="/budgets"
            className="nav-link"
            onClick={closeMenu}
          >
            Budget
          </Link>
          <Link
            to="/savings"
            className="nav-link"
            onClick={closeMenu}
          >
            Tabungan
          </Link>
        </nav>

        {/* kanan: user + logout - desktop */}
        <div className="navbar-user-desktop">
          <span className="user-greeting">Hi, {userName}</span>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMenu}
        >
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info */}
            <div className="mobile-user-info">
              <div className="user-greeting-mobile">Halo,</div>
              <div className="user-name-mobile">{userName}</div>
            </div>

            {/* Mobile menu items */}
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              🏠 Home
            </Link>
            <Link
              to="/transactions"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              💰 Transaksi
            </Link>
            <Link
              to="/budgets"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              📊 Budget
            </Link>
            <Link
              to="/savings"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              🏦 Tabungan
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="mobile-logout-btn"
            >
              🚪 Logout
            </button>

            {/* Close button */}
            <button
              onClick={closeMenu}
              className="mobile-close-btn"
            >
              Tutup Menu
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Base styles */
        .navbar-logo {
          font-weight: bold;
          font-size: clamp(14px, 4vw, 16px);
          white-space: nowrap;
        }

        .mobile-menu-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        /* Desktop styles - TAMPIL di desktop */
        .navbar-nav-desktop {
          display: none;
          gap: clamp(12px, 3vw, 20px);
          font-size: 14px;
          align-items: center;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .navbar-user-desktop {
          display: none;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .nav-link {
          color: white;
          text-decoration: none;
        }

        .user-greeting {
          font-size: 14px;
        }

        .logout-btn {
          background: #ef4444;
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        /* Mobile menu styles */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 80px 20px 20px 20px;
        }

        .mobile-menu-content {
          background: #1f2937;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: slideIn 0.3s ease-out;
        }

        .mobile-user-info {
          padding-bottom: 16px;
          border-bottom: 1px solid #374151;
          text-align: center;
        }

        .user-greeting-mobile {
          font-size: 16px;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .user-name-mobile {
          font-size: 18px;
          font-weight: 600;
        }

        .mobile-nav-link {
          color: white;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          background: #374151;
          font-size: 16px;
          text-align: center;
        }

        .mobile-logout-btn {
          background: #ef4444;
          border: none;
          color: white;
          padding: 14px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-top: 16px;
        }

        .mobile-close-btn {
          background: #6b7280;
          border: none;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
        }

        /* Desktop media query - ELEMEN DESKTOP DITAMPILKAN di sini */
        @media (min-width: 768px) {
          .navbar-nav-desktop {
            display: flex !important;
          }
          
          .navbar-user-desktop {
            display: flex !important;
          }
          
          .mobile-menu-btn {
            display: none !important;
          }
        }

        /* Mobile menu animation */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hover effects for desktop */
        @media (min-width: 768px) {
          .nav-link:hover {
            color: #d1d5db !important;
            transition: color 0.2s;
          }
          
          .logout-btn:hover {
            opacity: 0.9;
            transition: opacity 0.2s;
          }
        }

        /* Mobile menu item hover */
        .mobile-nav-link:hover,
        .mobile-logout-btn:hover,
        .mobile-close-btn:hover {
          opacity: 0.9;
          transition: opacity 0.2s;
        }
      `}</style>
    </>
  );
}