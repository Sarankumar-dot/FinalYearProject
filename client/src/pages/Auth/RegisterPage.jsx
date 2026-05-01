import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";

const roles = [
  {
    value: "student",
    label: "🎓 Student",
    desc: "Browse courses and learn in your preferred accessible format",
  },
  {
    value: "teacher",
    label: "🎓 Teacher",
    desc: "Upload lessons, create quizzes, and track class progress",
  },
  {
    value: "admin",
    label: "🛡️ Admin",
    desc: "Manage users, content, and the sign language library",
  },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    accessibilityType: "standard",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    const result = await register(
      form.name,
      form.email,
      form.password,
      form.role,
      form.accessibilityType,
    );
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
    >
      <div
        style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 100 }}
      >
        <ThemeToggle />
      </div>
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)",
          top: "30%",
          right: "20%",
          pointerEvents: "none",
        }}
      />

      <div
        className="card animate-fade-in"
        style={{ width: "100%", maxWidth: 500 }}
      >
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
            Create your free account
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
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              aria-label="Full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              aria-label="Email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              aria-label="Password"
            />
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label>I am a...</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.875rem 1rem",
                    borderRadius: 10,
                    border: `2px solid ${form.role === r.value ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:
                      form.role === r.value
                        ? "rgba(129,140,248,0.1)"
                        : "var(--color-surface2)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  aria-pressed={form.role === r.value}
                  aria-label={`Select role: ${r.label}`}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--color-text)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.775rem",
                        color: "var(--color-text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      {r.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Type Selector */}
          <div className="form-group">
            <label htmlFor="accessibility-type">
              My Accessibility Needs (Optional)
            </label>
            <select
              id="accessibility-type"
              value={form.accessibilityType}
              onChange={(e) =>
                setForm((f) => ({ ...f, accessibilityType: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface2)",
                color: "var(--color-text)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
              aria-label="Accessibility needs"
            >
              <option value="standard">👁️ Standard Access</option>
              <option value="visually-impaired">
                🔍 Visually Impaired - Screen Reader Optimized
              </option>
              <option value="hearing-impaired">
                👂 Hearing Impaired - Captions & Transcripts
              </option>
            </select>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginTop: "0.4rem",
              }}
            >
              {form.accessibilityType === "visually-impaired" &&
                "✓ Screen reader support, keyboard navigation, high contrast mode, and auto text-to-speech enabled."}
              {form.accessibilityType === "hearing-impaired" &&
                "✓ Large captions, transcripts, and visual indicators enabled."}
              {form.accessibilityType === "standard" &&
                "You can always update these settings later in your accessibility preferences."}
            </p>
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
          >
            {loading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--color-accent)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
