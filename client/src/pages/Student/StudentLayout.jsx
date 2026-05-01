import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccessibility } from "../../context/AccessibilityContext";
import {
  FaHome,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUniversalAccess,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import AccessibilityPanel from "../../components/AccessibilityPanel";
import ThemeToggle from "../../components/ThemeToggle";

const navLinks = [
  { to: "/student", label: "Dashboard", icon: <FaHome />, end: true, handSign: "🤙" },
  { to: "/student/courses", label: "Courses", icon: <FaBook />, handSign: "👐" },
  { to: "/student/documents", label: "Documents", icon: <FaBook />, handSign: "✋" },
  { to: "/student/progress", label: "My Progress", icon: <FaChartBar />, handSign: "☝️" },
  { to: "/student/settings", label: "Settings", icon: <FaCog />, handSign: "🤏" },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { prefs } = useAccessibility();
  const navigate = useNavigate();
  const [showA11y, setShowA11y] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        style={{
          padding: "1rem 0.5rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #818cf8, #22d3ee)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          👁
        </div>
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Bridging <span style={{ color: "var(--color-accent)" }}>the</span> Gap
        </span>
      </div>

      {/* User card */}
      <div
        style={{
          background: "rgba(129, 140, 248, 0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(129, 140, 248, 0.12)",
          borderRadius: 10,
          padding: "0.875rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #818cf8, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name}
          </div>
          <div
            className="badge badge-purple"
            style={{ fontSize: "0.7rem", marginTop: "0.15rem" }}
          >
            Student
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav aria-label="Student navigation" style={{ flex: 1 }}>
        {navLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.7rem 0.875rem",
              borderRadius: 10,
              marginBottom: "0.25rem",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: isActive ? "#fff" : "var(--color-text-muted)",
              background: isActive
                ? "linear-gradient(135deg, #818cf8, #6366f1)"
                : "transparent",
              transition: "all 0.2s",
            })}
            aria-current={undefined}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {l.icon} {l.label}
            </div>
            {user?.accessibilityType === "hearing-impaired" && (
              <span style={{ marginLeft: "auto", fontSize: "1.2rem", filter: "drop-shadow(0 0 2px rgba(255,255,255,0.2))" }} title={`Sign for ${l.label}`}>
                {l.handSign}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: A11y + Logout */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "1rem",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <ThemeToggle />
          <button
            onClick={() => setShowA11y((s) => !s)}
            className="btn btn-secondary"
            style={{
              flex: 1,
              justifyContent: "center",
              fontSize: "0.8rem",
              padding: "0.6rem 0.5rem",
            }}
            aria-label="Open accessibility settings"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaUniversalAccess /> A11y
            </div>
            {user?.accessibilityType === "hearing-impaired" && (
              <span style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }}>🙌</span>
            )}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: "0.8rem",
          }}
          aria-label="Sign out"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaSignOutAlt /> Sign Out
          </div>
          {user?.accessibilityType === "hearing-impaired" && (
            <span style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }}>👋</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="layout-with-sidebar">
      {/* Desktop sidebar */}
      <aside
        className="sidebar"
        style={{ display: "none @media(min-width:768px)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger */}
      <button
        onClick={() => setMobileOpen((s) => !s)}
        style={{
          display: "none",
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 200,
          background: "var(--color-accent)",
          border: "none",
          borderRadius: 8,
          padding: "0.6rem",
          color: "#fff",
          cursor: "pointer",
        }}
        id="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Always show sidebar on desktop via media query in CSS */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: ${mobileOpen ? "flex" : "none"} !important; position: fixed; z-index: 150; height: 100%; }
          #mobile-menu-btn { display: flex !important; }
          .main-content { padding-top: 4rem; }
        }
        @media (min-width: 769px) {
          .sidebar { display: flex !important; flex-direction: column; }
        }
      `}</style>

      <main className="main-content" id="main-content">
        <Outlet />
      </main>

      {showA11y && <AccessibilityPanel onClose={() => setShowA11y(false)} />}
    </div>
  );
}
