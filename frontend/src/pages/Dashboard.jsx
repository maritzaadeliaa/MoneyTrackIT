// ===========================
// src/pages/Dashboard.jsx
// ===========================
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

const defaultSummary = {
  mainBalance: 0,
  savingBalance: 0,
  totalIncome: 0,
  totalExpense: 0,
  categoryStatus: [],
};

export default function Dashboard() {
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/analytics/summary");

        // Ambil data exactly sesuai backend
        const payload = res.data;

      setSummary({
        mainBalance: payload.mainBalance,
        savingBalance: payload.savingBalance,
        totalIncome: payload.totalIncome,
        totalExpense: payload.totalExpense,
        categoryStatus: payload.categoryStatus,
      });

      } catch (err) {
        console.error(err);
        setSummary(defaultSummary);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading)
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar />
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #e0f2fe",
                borderTop: "3px solid #0ea5e9",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            ></div>
            <p style={{ color: "#64748b", margin: 0 }}>Memuat data...</p>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  const categories = summary.categoryStatus;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      <main style={{ 
        padding: "16px", 
        maxWidth: "1200px", 
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "clamp(24px, 5vw, 28px)",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Dashboard Overview
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "clamp(14px, 3vw, 16px)",
              margin: 0,
            }}
          >
            Ringkasan keuangan dan status budget Anda
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title="Total Uang"
            amount={summary.mainBalance}
            icon="💰"
            color="#0ea5e9"
            bgColor="#e0f2fe"
          />
          <StatCard
            title="Tabungan"
            amount={summary.savingBalance}
            icon="🏦"
            color="#10b981"
            bgColor="#d1fae5"
          />
          <StatCard
            title="Pemasukan"
            amount={summary.totalIncome}
            icon="📈"
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
          <StatCard
            title="Pengeluaran"
            amount={summary.totalExpense}
            icon="📉"
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </div>

        {/* Category Status */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(18px, 4vw, 20px)",
                fontWeight: "600",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Status Per Kategori
            </h2>

            <span
              style={{
                fontSize: "14px",
                color: "#64748b",
                background: "#f8fafc",
                padding: "4px 12px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {categories.length} Kategori
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
            }}
          >
            {categories.map((cat, index) => (
              <CategoryCard key={index} category={cat} index={index} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// =============== STAT CARD ===================
function StatCard({ title, amount, icon, color, bgColor }) {
  return (
    <div
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #f1f5f9",
        transition: "0.2s",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            color: "#64748b", 
            margin: 0, 
            marginBottom: 8,
            fontSize: "clamp(12px, 3vw, 14px)"
          }}>
            {title}
          </p>
          <p
            style={{
              fontSize: "clamp(16px, 4vw, 20px)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            Rp {amount.toLocaleString("id-ID")}
          </p>
        </div>
        <div
          style={{
            width: "clamp(36px, 8vw, 44px)",
            height: "clamp(36px, 8vw, 44px)",
            background: bgColor,
            borderRadius: 10,
            fontSize: "clamp(16px, 4vw, 18px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
            marginLeft: "8px",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// =============== CATEGORY CARD ===================
function CategoryCard({ category, index }) {
  const colors = [
    { primary: "#0ea5e9", light: "#e0f2fe" },
    { primary: "#8b5cf6", light: "#ede9fe" },
    { primary: "#f59e0b", light: "#fef3c7" },
    { primary: "#10b981", light: "#d1fae5" },
    { primary: "#f97316", light: "#ffedd5" },
    { primary: "#64748b", light: "#f1f5f9" },
  ];

  const color = colors[index % colors.length];
  const percentage = category.budget
    ? (category.spent / category.budget) * 100
    : 0;

  return (
    <div
      style={{
        background: "white",
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${color.light}`,
        minHeight: "120px",
      }}
    >
      <div style={{ width: "100%" }}>
        <h3 style={{ 
          margin: 0, 
          marginBottom: 8,
          fontSize: "clamp(14px, 3vw, 16px)"
        }}>
          {category.displayName}
        </h3>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <span style={{ 
              color: "#64748b",
              fontSize: "clamp(12px, 3vw, 14px)"
            }}>
              Dipakai
            </span>
            <span style={{ 
              color: color.primary, 
              fontWeight: 600,
              fontSize: "clamp(12px, 3vw, 14px)",
              textAlign: "right"
            }}>
              Rp {category.spent.toLocaleString("id-ID")}
            </span>
          </div>

          {category.budget && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <span style={{ 
                color: "#64748b",
                fontSize: "clamp(12px, 3vw, 14px)"
              }}>
                Batas
              </span>
              <span style={{ 
                fontWeight: 600,
                fontSize: "clamp(12px, 3vw, 14px)",
                textAlign: "right"
              }}>
                Rp {category.budget.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {category.budget && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "clamp(11px, 2.5vw, 12px)",
                marginBottom: 6,
                alignItems: "center",
              }}
            >
              <span>Progress</span>
              <span
                style={{
                  color:
                    percentage >= 90
                      ? "#ef4444"
                      : percentage >= 75
                      ? "#f59e0b"
                      : color.primary,
                  fontWeight: 600,
                }}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: 6,
                background: "#e2e8f0",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  height: "100%",
                  background:
                    percentage >= 90
                      ? "#ef4444"
                      : percentage >= 75
                      ? "#f59e0b"
                      : color.primary,
                  borderRadius: 4,
                }}
              />
            </div>
          </>
        )}

        {/* Status pesan */}
        {category.statusMessage && (
          <p
            style={{
              marginTop: 8,
              fontSize: "clamp(11px, 2.5vw, 12px)",
              lineHeight: 1.3,
            }}
          >
            {category.statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}