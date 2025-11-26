import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "food",
    maxBudget: ""
  });

  // Match dengan enum di backend
  const categories = [
    { value: "food", label: "Makanan & Minuman" },
    { value: "housing", label: "Tempat Tinggal" },
    { value: "transport", label: "Transportasi" },
    { value: "clothing", label: "Pakaian" },
    { value: "medical", label: "Kesehatan" },
    { value: "others", label: "Lain-lain" }
  ];

  // Function untuk convert enum value ke label
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setError("");
      setLoading(true);
      console.log("🔄 Fetching budgets...");
      
      const res = await api.get("/budgets");
      console.log("✅ Budgets response:", res.data);
      
      if (res.data && Array.isArray(res.data.budgets)) {
        // ✅ PERBAIKAN: Tambah default value untuk currentSpent
        const budgetsWithDefault = res.data.budgets.map(budget => ({
          ...budget,
          currentSpent: budget.currentSpent || 0
        }));
        setBudgets(budgetsWithDefault);
      } else {
        setBudgets([]);
      }
    } catch (err) {
      console.error("❌ Error fetching budgets:", err);
      setError("Gagal memuat data budgets");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "maxBudget") {
      // ✅ PERBAIKAN: Hanya allow numbers, remove formatting
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi client-side
    if (!form.maxBudget || isNaN(form.maxBudget) || Number(form.maxBudget) <= 0) {
      alert("Batas bulanan harus berupa angka yang valid dan lebih dari 0");
      return;
    }

    try {
      const newBudget = {
        category: form.category,
        maxBudget: Number(form.maxBudget)
      };

      console.log("📤 Data yang akan dikirim:", newBudget);

      // Cek apakah kategori sudah ada
      const existingBudgetIndex = budgets.findIndex(b => b.category === form.category);
      
      let updatedBudgets;
      if (existingBudgetIndex !== -1) {
        // Update budget yang sudah ada
        updatedBudgets = [...budgets];
        updatedBudgets[existingBudgetIndex] = newBudget;
      } else {
        // Tambah budget baru
        updatedBudgets = [...budgets, newBudget];
      }

      console.log("🔄 Updated budgets array:", updatedBudgets);

      // Kirim seluruh array budgets ke backend
      const response = await api.post("/budgets", { 
        budgets: updatedBudgets
      });

      console.log("✅ Response dari server:", response.data);

      // Reset form
      setForm({
        category: "food", 
        maxBudget: ""
      });
      
      // Refresh data
      fetchBudgets();
      
      alert("Budget berhasil disimpan!");
      
    } catch (err) {
      console.error("❌ Detail error creating budget:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || "Gagal menyimpan budget. Pastikan data valid.";
      alert(errorMessage);
    }
  };

  const deleteBudget = async (category) => {
    if (window.confirm(`Hapus budget untuk ${getCategoryLabel(category)}?`)) {
      try {
        // Filter out the budget to delete
        const updatedBudgets = budgets.filter(b => b.category !== category);
        
        console.log("🗑️ Deleting budget, sending:", updatedBudgets);
        
        // Kirim updated budgets ke backend
        await api.post("/budgets", { 
          budgets: updatedBudgets 
        });
        
        fetchBudgets();
        alert("Budget berhasil dihapus!");
      } catch (err) {
        console.error("❌ Error deleting budget:", err);
        const errorMessage = err.response?.data?.message || "Gagal menghapus budget.";
        alert(errorMessage);
      }
    }
  };

  const updateBudget = async (category, newMaxBudget) => {
    // Validasi
    if (!newMaxBudget || isNaN(newMaxBudget) || Number(newMaxBudget) <= 0) {
      alert("Batas bulanan harus berupa angka yang valid dan lebih dari 0");
      return;
    }

    try {
      // Update budget dalam array
      const updatedBudgets = budgets.map(b => 
        b.category === category 
          ? { ...b, maxBudget: Number(newMaxBudget) }
          : b
      );

      console.log("✏️ Updating budget, sending:", updatedBudgets);

      // Kirim updated budgets ke backend
      await api.post("/budgets", { 
        budgets: updatedBudgets 
      });
      
      fetchBudgets();
      alert("Budget berhasil diupdate!");
    } catch (err) {
      console.error("❌ Error updating budget:", err);
      const errorMessage = err.response?.data?.message || "Gagal mengupdate budget.";
      alert(errorMessage);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ 
        padding: "16px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        height: "50vh"
      }}>
        <div style={{ 
          background: "white", 
          padding: "24px", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          textAlign: "center"
        }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "3px solid #e0f2fe",
            borderTop: "3px solid #0ea5e9",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#64748b", margin: 0 }}>Memuat budgets...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "700", 
            color: "#0f172a",
            marginBottom: "8px"
          }}>
            Kelola Budget
          </h1>
          <p style={{ 
            color: "#64748b", 
            fontSize: "16px",
            margin: 0
          }}>
            Atur batas pengeluaran bulanan per kategori
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca", 
            color: "#dc2626",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {/* Form Set Budget */}
        <div style={{ 
          background: "white", 
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9",
          marginBottom: "32px"
        }}>
          <h2 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            color: "#0f172a",
            marginBottom: "20px"
          }}>
            {budgets.some(b => b.category === form.category) ? "Update Budget" : "Atur Budget Baru"}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Kategori
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Batas Bulanan (Rp)
                </label>
                {/* ✅ PERBAIKAN: Ganti ke text input dengan pattern */}
                <input
                  type="text"
                  name="maxBudget"
                  value={form.maxBudget}
                  onChange={handleChange}
                  placeholder="Contoh: 500000"
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <small style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  Hanya angka tanpa titik atau koma
                </small>
              </div>
            </div>

            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "14px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                justifySelf: "start",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
              onMouseOut={(e) => e.target.style.background = "#2563eb"}
            >
              {budgets.some(b => b.category === form.category) ? "🔄 Update Budget" : "💰 Simpan Budget"}
            </button>
          </form>
        </div>

        {/* Daftar Budget */}
        <div style={{ 
          background: "white", 
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <h2 style={{ 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#0f172a",
              margin: 0
            }}>
              Budget Anda
            </h2>
            <span style={{ 
              fontSize: "14px", 
              color: "#64748b",
              background: "#f8fafc",
              padding: "4px 12px",
              borderRadius: "20px"
            }}>
              {budgets.length} Budget
            </span>
          </div>
          
          {!Array.isArray(budgets) || budgets.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "48px",
              color: "#64748b"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📊</div>
              <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "500" }}>
                Belum ada budget yang diatur
              </p>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Mulai dengan mengatur budget pertama Anda
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {budgets.map((budget, index) => (
                <BudgetItem 
                  key={budget.category || index}
                  budget={budget} 
                  index={index}
                  onUpdate={updateBudget}
                  onDelete={deleteBudget}
                  getCategoryLabel={getCategoryLabel}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Component untuk setiap item budget
function BudgetItem({ budget, index, onUpdate, onDelete, getCategoryLabel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMaxBudget, setEditMaxBudget] = useState(budget.maxBudget || "");

  const colors = [
    { primary: "#0ea5e9", light: "#e0f2fe" },
    { primary: "#8b5cf6", light: "#ede9fe" },
    { primary: "#f59e0b", light: "#fef3c7" },
    { primary: "#10b981", light: "#d1fae5" },
    { primary: "#f97316", light: "#ffedd5" },
    { primary: "#64748b", light: "#f1f5f9" }
  ];
  
  const color = colors[index % colors.length];

  const handleEditChange = (e) => {
    // ✅ PERBAIKAN: Juga gunakan text input untuk edit
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setEditMaxBudget(numericValue);
  };

  const handleSave = () => {
    if (!editMaxBudget || isNaN(editMaxBudget) || Number(editMaxBudget) <= 0) {
      alert("Batas bulanan harus berupa angka yang valid dan lebih dari 0");
      return;
    }
    onUpdate(budget.category, editMaxBudget);
    setIsEditing(false);
  };

  const getUsagePercentage = () => {
    if (!budget.maxBudget || !budget.currentSpent) return 0;
    return (budget.currentSpent / budget.maxBudget) * 100;
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "#ef4444";
    if (percentage >= 75) return "#f59e0b"; 
    return color.primary;
  };

  const percentage = getUsagePercentage();

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      border: `1px solid ${color.light}`,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Accent bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "4px",
        height: "100%",
        background: color.primary
      }}></div>

      <div style={{ paddingLeft: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#0f172a",
              margin: "0 0 8px 0"
            }}>
              {getCategoryLabel(budget.category)}
            </h3>
            
            <div style={{ display: "grid", gap: "6px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "14px"
              }}>
                <span style={{ color: "#64748b" }}>Terpakai</span>
                <span style={{ fontWeight: "600", color: color.primary }}>
                  Rp {((budget.currentSpent || 0)).toLocaleString("id-ID")}
                </span>
              </div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "14px"
              }}>
                <span style={{ color: "#64748b" }}>Batas Bulanan</span>
                {isEditing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* ✅ PERBAIKAN: Juga gunakan text input untuk edit */}
                    <input
                      type="text"
                      value={editMaxBudget}
                      onChange={handleEditChange}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      style={{ 
                        width: "140px", 
                        padding: "6px 8px", 
                        border: "1px solid #d1d5db", 
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontWeight: "600" }}>
                    Rp {((budget.maxBudget || 0)).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
            {isEditing ? (
              <>
                <ActionButton 
                  onClick={handleSave}
                  label="Simpan"
                  color="#10b981"
                  icon="✓"
                />
                <ActionButton 
                  onClick={() => {
                    setIsEditing(false);
                    setEditMaxBudget(budget.maxBudget);
                  }}
                  label="Batal"
                  color="#64748b"
                  icon="✕"
                />
              </>
            ) : (
              <>
                <ActionButton 
                  onClick={() => setIsEditing(true)}
                  label="Edit"
                  color="#3b82f6"
                  icon="✏️"
                />
                <ActionButton 
                  onClick={() => onDelete(budget.category)}
                  label="Hapus"
                  color="#ef4444"
                  icon="🗑️"
                />
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {budget.maxBudget && (
          <div style={{ marginBottom: "8px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              fontSize: "13px", 
              marginBottom: "8px" 
            }}>
              <span style={{ color: "#64748b" }}>Progress Pengeluaran</span>
              <span style={{ 
                fontWeight: "600", 
                color: getProgressBarColor(percentage) 
              }}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#e2e8f0",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${Math.min(percentage, 100)}%`,
                height: "100%",
                background: getProgressBarColor(percentage),
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        )}

        {percentage >= 90 && budget.maxBudget && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            marginTop: "8px"
          }}>
            <span style={{ color: "#ef4444", fontSize: "14px" }}>⚠️</span>
            <span style={{ 
              fontSize: "12px", 
              color: "#ef4444", 
              fontWeight: "500"
            }}>
              Budget hampir habis!
            </span>
          </div>
        )}

        {!budget.maxBudget && (
          <p style={{ 
            fontSize: "13px", 
            color: "#94a3b8",
            fontStyle: "italic",
            margin: "12px 0 0 0"
          }}>
            Belum ada batas pengeluaran yang diatur
          </p>
        )}
      </div>
    </div>
  );
}

// Component untuk Action Button
function ActionButton({ onClick, label, color, icon }) {
  const darkenColor = (hexColor) => {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 20);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 20);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 20);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: "white",
        padding: "8px 12px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
        transition: "background-color 0.2s"
      }}
      onMouseOver={(e) => e.target.style.background = darkenColor(color)}
      onMouseOut={(e) => e.target.style.background = color}
    >
      <span style={{ fontSize: "12px" }}>{icon}</span>
      {label}
    </button>
  );
}