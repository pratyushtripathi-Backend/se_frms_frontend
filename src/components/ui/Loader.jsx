import { useEffect } from "react";

const STYLE_ID = "frms-loader-keyframes";

function ensureLoaderStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes frms-loader-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function Loader({
  label = "Loading...",
  size = 28,
  color = "#2563EB",
  trackColor = "#E5E7EB",
  fullWidth = true,
}) {
  useEffect(() => {
    ensureLoaderStyles();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "28px 0",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid ${trackColor}`,
          borderTopColor: color,
          display: "inline-block",
          animation: "frms-loader-spin 0.8s linear infinite",
        }}
      />
      {label && (
        <span style={{ fontSize: "13px", color: "#555555", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
}
