import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

export default function Savings() {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [showForm, setShowForm] = useState(false);
  const [transferType, setTransferType] = useState("to-saving"); // 'to-saving' or 'from-saving'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data untuk mendapatkan saldo
      const userRes = await api.get("/auth/me");
      setUserData(userRes.data);
      
      // Fetch transactions untuk melihat riwayat transfer
      const txRes = await api.get("/transactions");
      const allTransactions = Array.isArray(txRes.data) ? txRes.data : 
                             txRes.data.transactions || txRes.data.data || [];
      
      // Filter hanya transaksi transfer tabungan
      const savingTransactions = allTransactions.filter(tx => 
        tx.type === "TRANSFER_TO_SAVING" || tx.type === "TRANSFER_FROM_SAVING"
      );
      
      setTransactions(savingTransactions);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      // Fallback data
      setUserData({
        mainBalance: 0,
        savingBalance: 0
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = transferType === "to-saving" 
        ? "/transactions/transfer/to-saving" 
        : "/transactions/transfer/from-saving";
      
      await api.post(endpoint, {
        ...form,
        amount: Number(form.amount)
      });
      
      // Reset form
      setForm({
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0]
      });
      setShowForm(false);
      
      // Refresh data
      fetchData();
      
    } catch (err) {
      console.error("Error processing transfer:", err);
      alert(err.response?.data?.message || "Gagal memproses transfer");
    }
  };

  // Hitung total setoran dan penarikan dari transactions
  const totalDeposits = transactions
    .filter(tx => tx.type === "TRANSFER_TO_SAVING")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(tx => tx.type === "TRANSFER_FROM_SAVING")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

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
          <p style={{ color: "#64748b", margin: 0 }}>Memuat tabungan...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />

      <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "700", 
            color: "#0f172a",
            marginBottom: "8px"
          }}>
            Tabungan Saya
          </h1>
          <p style={{ 
            color: "#64748b", 
            fontSize: "16px",
            margin: 0
          }}>
            Kelola tabungan dan riwayat transfer
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
          gap: "20px",
          marginBottom: "32px"
        }}>
          <StatCard 
            title="Saldo Tabungan"
            amount={userData?.savingBalance || 0}
            icon="🏦"
            color="#10b981"
            bgColor="#d1fae5"
          />

          <StatCard 
            title="Saldo Utama"
            amount={userData?.mainBalance || 0}
            icon="💰"
            color="#0ea5e9"
            bgColor="#e0f2fe"
          />

          <StatCard 
            title="Total Setoran"
            amount={totalDeposits}
            icon="📥"
            color="#8b5cf6"
            bgColor="#ede9fe"
          />

          <StatCard 
            title="Total Penarikan"
            amount={totalWithdrawals}
            icon="📤"
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "32px",
          flexWrap: "wrap"
        }}>
          <ActionButton 
            onClick={() => {
              setTransferType("to-saving");
              setForm({ 
                amount: "", 
                note: "", 
                date: new Date().toISOString().split("T")[0] 
              });
              setShowForm(true);
            }}
            label="Setor ke Tabungan"
            icon="➕"
            color="#10b981"
          />
          
          <ActionButton 
            onClick={() => {
              setTransferType("from-saving");
              setForm({ 
                amount: "", 
                note: "", 
                date: new Date().toISOString().split("T")[0] 
              });
              setShowForm(true);
            }}
            label="Tarik dari Tabungan"
            icon="➖"
            color="#f59e0b"
          />
        </div>

        {/* Form Transfer */}
        {showForm && (
          <div style={{ 
            background: "white", 
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
            marginBottom: "32px"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#0f172a",
                margin: 0
              }}>
                {transferType === "to-saving" ? "Setor ke Tabungan" : "Tarik dari Tabungan"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Masukkan jumlah"
                  required
                  min="1"
                  max={transferType === "to-saving" ? userData?.mainBalance : userData?.savingBalance}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                />
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
                  {transferType === "to-saving" 
                    ? `Saldo utama tersedia: Rp ${(userData?.mainBalance || 0).toLocaleString("id-ID")}`
                    : `Saldo tabungan tersedia: Rp ${(userData?.savingBalance || 0).toLocaleString("id-ID")}`
                  }
                </p>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder={transferType === "to-saving" ? "Contoh: Tabungan bulanan" : "Contoh: Dana darurat"}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "8px",
                    fontSize: "16px"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: transferType === "to-saving" ? "#10b981" : "#f59e0b",
                    color: "white",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  {transferType === "to-saving" ? "💵 Setor Sekarang" : "💸 Tarik Sekarang"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "none",
                    color: "#64748b",
                    padding: "12px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Riwayat Transaksi */}
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
              Riwayat Transfer Tabungan
            </h2>
            <span style={{ 
              fontSize: "14px", 
              color: "#64748b",
              background: "#f8fafc",
              padding: "4px 12px",
              borderRadius: "20px"
            }}>
              {transactions.length} Transaksi
            </span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              color: "#64748b"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏦</div>
              <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Belum ada transaksi tabungan</p>
              <p style={{ margin: 0, fontSize: "14px" }}>Mulai dengan menyetor ke tabungan pertama Anda</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {transactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction._id || index} 
                  transaction={transaction}
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

// Component untuk Stat Card
function StatCard({ title, amount, icon, color, bgColor }) {
  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      border: "1px solid #f1f5f9"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ 
            fontSize: "14px", 
            color: "#64748b", 
            margin: "0 0 8px 0",
            fontWeight: "500"
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            color: "#0f172a",
            margin: 0
          }}>
            Rp {amount?.toLocaleString("id-ID") || 0}
          </p>
        </div>
        <div style={{
          width: "48px",
          height: "48px",
          background: bgColor,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px"
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Component untuk Action Button
function ActionButton({ onClick, label, icon, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "white",
        color: "#374151",
        padding: "16px 20px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: "160px"
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </button>
  );
}

// Component untuk Transaction Item
function TransactionItem({ transaction }) {
  const isDeposit = transaction.type === "TRANSFER_TO_SAVING";
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      background: "#fafafa",
      borderRadius: "12px",
      border: "1px solid #f1f5f9"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: isDeposit ? "#d1fae5" : "#fef3c7",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px"
        }}>
          {isDeposit ? "📥" : "📤"}
        </div>
        
        <div>
          <div style={{ 
            fontSize: "15px", 
            fontWeight: "600", 
            color: "#0f172a",
            marginBottom: "2px"
          }}>
            {transaction.note || (isDeposit ? "Setoran ke Tabungan" : "Penarikan dari Tabungan")}
          </div>
          <div style={{ 
            fontSize: "13px", 
            color: "#64748b" 
          }}>
            {transaction.date ? new Date(transaction.date).toLocaleDateString("id-ID") : "Tanggal tidak tersedia"}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: "16px", 
        fontWeight: "700", 
        color: isDeposit ? "#10b981" : "#f59e0b" 
      }}>
        {isDeposit ? "+" : "-"} Rp {transaction.amount?.toLocaleString("id-ID")}
      </div>
    </div>
  );
}