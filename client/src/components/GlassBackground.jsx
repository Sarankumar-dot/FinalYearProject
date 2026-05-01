import React from "react";
export default function GlassBackground() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -10, overflow: "hidden", background: "#020617", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "#4f46e5", filter: "blur(120px)", opacity: 0.6, animation: "ambient-drift-1 15s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "#0891b2", filter: "blur(150px)", opacity: 0.5, animation: "ambient-drift-2 20s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", top: "30%", left: "30%", width: "40vw", height: "40vw", borderRadius: "50%", background: "#c026d3", filter: "blur(140px)", opacity: 0.4, animation: "ambient-drift-3 18s ease-in-out infinite alternate-reverse" }} />
    </div>
  );
}
