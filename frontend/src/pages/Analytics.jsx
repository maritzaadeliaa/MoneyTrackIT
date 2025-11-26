import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dailyExpense, setDailyExpense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });

  // Warna untuk chart kategori
  const categoryColors = {
    food: "#ef4444",
    housing: "#3b82f6", 
    transport: "#f59e0b",
    clothing: "#8b5cf6",
    medical: "#10b981",
    others: "#6b7280"
  };

  const categoryIcons = {
    food: "🍔",
    housing: "🏠",
    transport: "🚗",
    clothing: "👕",
    medical: "🏥",
    others: "📦"
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      // Fetch semua data analytics sekaligus
      const [summaryRes, categoriesRes, dailyRes] = await Promise.all([
        api.get(`/analytics/summary?${params}`),
        api.get(`/analytics/categories?${params}`),
        api.get(`/analytics/daily-expense?${params}`)
      ]);

      setSummary(summaryRes.data);
      setCategoryStats(categoriesRes.data.data || []);
      setDailyExpense(dailyRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data analytics.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    fetchAnalyticsData();
  };

  const handleResetFilter = () => {
    setDateRange({ from: "", to: "" });
    // Reset akan di-trigger oleh useEffect
  };

  // Re-fetch data ketika dateRange berubah (setelah reset)
  useEffect(() => {
    if (!dateRange.from && !dateRange.to) {
      fetchAnalyticsData();
    }
  }, [dateRange.from, dateRange.to]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
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
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Memuat data analytics...
            </p>
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
              marginBottom: "6px",
              lineHeight: "1.2",
            }}
          >
            Analytics
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "clamp(14px, 3vw, 16px)",
              margin: 0,
              lineHeight: "1.4",
            }}
          >
            Analisis keuangan dan pengeluaran Anda
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            {error}
          </div>
        )}

        {/* Date Filter */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0f172a",
              margin: "0 0 16px 0",
            }}
          >
            Filter Tanggal
          </h3>
          <form
            onSubmit={handleDateFilter}
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "1fr",
              // Responsive
              "@media (min-width: 640px)": {
                gridTemplateColumns: "1fr 1fr auto auto",
              }
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  color: "#475569",
                  fontWeight: "500",
                }}
              >
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  color: "#475569",
                  fontWeight: "500",
                }}
              >
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                alignSelf: "flex-end",
                // Responsive
                "@media (min-width: 640px)": {
                  alignSelf: "flex-end",
                }
              }}
            >
              Terapkan
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                alignSelf: "flex-end",
                // Responsive
                "@media (min-width: 640px)": {
                  alignSelf: "flex-end",
                }
              }}
            >
              Reset
            </button>
          </form>
        </div>

        {summary && (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                marginBottom: "20px",
              }}
            >
              {/* Saldo Utama */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#dbeafe",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>💰</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2px 0" }}>
                      Saldo Utama
                    </h3>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                      {formatCurrency(summary.mainBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabungan */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#dcfce7",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>🏦</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2px 0" }}>
                      Tabungan
                    </h3>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                      {formatCurrency(summary.savingBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Pemasukan */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#dcfce7",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>📈</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2px 0" }}>
                      Total Pemasukan
                    </h3>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#16a34a", margin: 0 }}>
                      +{formatCurrency(summary.totalIncome)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Pengeluaran */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>📉</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2px 0" }}>
                      Total Pengeluaran
                    </h3>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                      -{formatCurrency(summary.totalExpense)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Stats & Status */}
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "1fr",
                // Responsive
                "@media (min-width: 1024px)": {
                  gridTemplateColumns: "1fr 1fr",
                }
              }}
            >
              {/* Pie Chart Kategori */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#0f172a",
                    margin: "0 0 16px 0",
                  }}
                >
                  Pengeluaran per Kategori
                </h3>

                {categoryStats.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                    Tidak ada data pengeluaran
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {categoryStats.map((stat, index) => (
                      <div
                        key={stat.category}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "4px",
                              background: categoryColors[stat.category] || "#6b7280",
                            }}
                          ></div>
                          <span style={{ fontWeight: "500", fontSize: "14px" }}>
                            {stat.category}
                          </span>
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>
                          {formatCurrency(stat.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Budget per Kategori */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#0f172a",
                    margin: "0 0 16px 0",
                  }}
                >
                  Status Budget
                </h3>

                {summary.categoryStatus && summary.categoryStatus.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {summary.categoryStatus.map((category) => (
                      <div
                        key={category.category}
                        style={{
                          padding: "16px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "18px", marginRight: "8px" }}>
                            {categoryIcons[category.category]}
                          </span>
                          <div>
                            <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 2px 0" }}>
                              {category.displayName}
                            </h4>
                            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                              Terpakai: {formatCurrency(category.spent)}
                              {category.budget && ` / ${formatCurrency(category.budget)}`}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {category.budget && category.budget > 0 && (
                          <div style={{ marginBottom: "8px" }}>
                            <div
                              style={{
                                width: "100%",
                                height: "6px",
                                background: "#e2e8f0",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(category.percentage, 100)}%`,
                                  height: "100%",
                                  background: 
                                    category.percentage < 50 ? "#10b981" :
                                    category.percentage < 80 ? "#f59e0b" :
                                    category.percentage < 100 ? "#f97316" : "#ef4444",
                                  borderRadius: "3px",
                                  transition: "width 0.3s ease",
                                }}
                              ></div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {category.percentage ? `${category.percentage.toFixed(1)}%` : '0%'}
                              </span>
                              {category.percentage > 100 && (
                                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "500" }}>
                                  +{(category.percentage - 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <p
                          style={{
                            fontSize: "12px",
                            color: 
                              !category.budget ? "#64748b" :
                              category.percentage < 50 ? "#10b981" :
                              category.percentage < 80 ? "#f59e0b" :
                              category.percentage < 100 ? "#f97316" : "#ef4444",
                            margin: 0,
                            lineHeight: "1.4",
                            fontWeight: category.percentage >= 80 ? "600" : "400",
                          }}
                        >
                          {category.statusMessage}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                    Tidak ada data budget
                  </p>
                )}
              </div>
            </div>

            {/* Daily Expense */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #f1f5f9",
                marginTop: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                }}
              >
                Pengeluaran Harian
              </h3>

              {dailyExpense.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                  Tidak ada data pengeluaran harian
                </p>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {dailyExpense.slice(0, 10).map((daily, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: index % 2 === 0 ? "#f8fafc" : "transparent",
                        borderRadius: "6px",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        {formatDate(daily.date)}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#ef4444" }}>
                        -{formatCurrency(daily.totalExpense)}
                      </span>
                    </div>
                  ))}
                  {dailyExpense.length > 10 && (
                    <p style={{ textAlign: "center", color: "#64748b", fontSize: "12px", marginTop: "8px" }}>
                      Menampilkan 10 dari {dailyExpense.length} hari
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .category-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .date-filter-form {
            grid-template-columns: 1fr;
          }
          
          .filter-buttons {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}