import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ThemeToggle from "../../components/ThemeToggle";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.success) {
      const r = result.user.role;
      if (r === "teacher") navigate("/teacher");
      else if (r === "admin") navigate("/admin");
      else navigate("/student");
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "2rem",
      }}
      role="main"
      aria-label="Login page"
    >
      <div
        style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 100 }}
      >
        <ThemeToggle />
      </div>
      {/* Background blob */}
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div
        className="card animate-fade-in"
        style={{ width: "100%", maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.75rem",
                fontSize: "1.5rem",
              }}
              aria-hidden="true"
            >
              👁
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "var(--color-text)",
              }}
            >
              Bridging <span style={{ color: "var(--color-accent)" }}>the</span>{" "}
              Gap
            </div>
          </Link>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            Welcome back. Sign in to continue.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} role="form" aria-label="Login form">
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              autoComplete="email"
              aria-label="Email address"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                autoComplete="current-password"
                aria-label="Password"
                aria-required="true"
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: "0.25rem",
                  fontSize: "1rem",
                }}
                aria-label={showPass ? "Hide password" : "Show password"}
                aria-pressed={showPass}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.8rem",
              marginTop: "0.5rem",
            }}
            aria-label="Sign in"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            marginTop: "1.5rem",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--color-accent)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </p>

        {/* Demo accounts hint with accessibility info */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.875rem",
            background: "rgba(129,140,248,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(129,140,248,0.15)",
          }}
        >
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-text-muted)",
              marginBottom: "0.4rem",
              fontWeight: 600,
            }}
          >
            💡 Tips:
          </p>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-text-muted)",
              marginBottom: "0.3rem",
            }}
          >
            • Register with role: Student · Teacher · Admin
          </p>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-text-muted)",
              marginBottom: "0.3rem",
            }}
          >
            • Select accessibility needs during registration
          </p>
          <p style={{ fontSize: "0.775rem", color: "var(--color-text-muted)" }}>
            • Use <kbd>Alt</kbd> + <kbd>A</kbd> to access settings after login
          </p>
        </div>
      </div>
    </div>
  );
}
