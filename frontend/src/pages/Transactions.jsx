import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

// TAMBAHKAN BASE URL BACKEND DI SINI
const API_BASE_URL = "http://localhost:5000"; // Sesuaikan dengan URL backend Anda

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const [form, setForm] = useState({
    amount: "",
    category: "Makanan & Minuman",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    receiptFile: null,
  });

  const categories = [
    "Makanan & Minuman",
    "Tempat Tinggal",
    "Transportasi",
    "Pakaian",
    "Kesehatan",
    "Lain-lain",
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const extractTransactionsArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.transactions)) return data.transactions;
    return [];
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/transactions");
      const list = extractTransactionsArray(res.data);
      setTransactions(list);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat transaksi.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({
      ...prev,
      receiptFile: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }

    const apiType = form.type === "income" ? "INCOME" : "EXPENSE";

    const formData = new FormData();
    formData.append("type", apiType);
    formData.append("category", apiType === "EXPENSE" ? form.category : "");
    formData.append("amount", Number(form.amount));
    formData.append("note", form.description);
    formData.append("date", form.date);
    
    if (form.receiptFile) {
      formData.append("receipt", form.receiptFile);
    }

    try {
      await api.post("/transactions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({
        amount: "",
        category: "Makanan & Minuman",
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0],
        receiptFile: null,
      });
      setFileKey((k) => k + 1);
      fetchTransactions();
      setCurrentPage(1); // Reset ke halaman pertama setelah menambah transaksi baru
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menambahkan transaksi.");
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus transaksi.");
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
            <p style={{ color: "#64748b", margin: 0 }}>Memuat data...</p>
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

      {/* Modal untuk melihat gambar */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <img
              src={selectedImage}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "8px",
              }}
            />
            <button
              onClick={closeImageModal}
              style={{
                position: "absolute",
                top: "-50px",
                right: "0",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "12px 16px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                width: "44px",
                height: "44px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main style={{ 
        padding: "16px", 
        maxWidth: "1200px", 
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "clamp(24px, 5vw, 28px)",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Transaksi
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "clamp(14px, 3vw, 16px)",
              margin: 0,
            }}
          >
            Kelola pemasukan dan pengeluaran harian Anda
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div className="transactions-layout">
          {/* Form Tambah Transaksi */}
          <div className="form-section">
            <h2
              style={{
                fontSize: "clamp(18px, 4vw, 20px)",
                fontWeight: "600",
                color: "#0f172a",
                margin: "0 0 16px 0",
              }}
            >
              Tambah Transaksi
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "14px" }}
              encType="multipart/form-data"
            >
              <div className="form-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: "500",
                    }}
                  >
                    Jumlah
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 50000"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: "500",
                    }}
                  >
                    Tipe
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "16px",
                      outline: "none",
                      background: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: "500",
                    }}
                  >
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "16px",
                      outline: "none",
                      background: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: "500",
                    }}
                  >
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
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    color: "#475569",
                    fontWeight: "500",
                  }}
                >
                  Keterangan
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi transaksi..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    color: "#475569",
                    fontWeight: "500",
                  }}
                >
                  Upload Struk / File (opsional)
                </label>
                <input
                  key={fileKey}
                  type="file"
                  name="receipt"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "6px",
                    lineHeight: 1.4,
                  }}
                >
                  Format: JPG, PNG, PDF (maks. 5MB)
                </p>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "8px",
                  background: form.type === "income" ? "#10b981" : "#2563eb",
                  color: "white",
                  padding: "14px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Tambah Transaksi
              </button>
            </form>
          </div>

          {/* Daftar Transaksi */}
          <div className="transactions-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
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
                Daftar Transaksi
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    background: "#f8fafc",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {transactions.length} item
                </span>
                {totalPages > 1 && (
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      background: "#f8fafc",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Halaman {currentPage} dari {totalPages}
                  </span>
                )}
              </div>
            </div>

            {transactions.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontStyle: "italic",
                  marginTop: "24px",
                  padding: "20px",
                  fontSize: "14px",
                }}
              >
                Belum ada transaksi yang tercatat
              </p>
            ) : (
              <>
                <div style={{ display: "grid", gap: "12px" }}>
                  {currentTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#0f172a",
                              marginBottom: "6px",
                              fontSize: "16px",
                              lineHeight: 1.3,
                            }}
                          >
                            {transaction.note || "Tanpa deskripsi"}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                              lineHeight: 1.4,
                              marginBottom: "8px",
                            }}
                          >
                            {(transaction.type === "INCOME"
                              ? "Pemasukan"
                              : transaction.type === "EXPENSE"
                              ? "Pengeluaran"
                              : transaction.type) || ""}
                            {" • "}
                            {transaction.category || "Tanpa kategori"}
                            {" • "}
                            {transaction.date
                              ? new Date(transaction.date).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              color:
                                transaction.type === "INCOME"
                                  ? "#16a34a"
                                  : "#ef4444",
                              fontWeight: "700",
                              fontSize: "16px",
                              textAlign: "right",
                              flex: 1,
                            }}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"} Rp{" "}
                            {transaction.amount?.toLocaleString("id-ID")}
                          </span>

                          <button
                            onClick={() => deleteTransaction(transaction._id)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              minWidth: "80px",
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {transaction.receiptUrl && (
                        <div
                          style={{
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                              marginBottom: "8px",
                            }}
                          >
                            File Struk:
                          </div>
                          
                          {transaction.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={`${API_BASE_URL}${transaction.receiptUrl}`}
                                alt="Struk transaksi"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "6px",
                                  border: "1px solid #e2e8f0",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => openImageModal(`${API_BASE_URL}${transaction.receiptUrl}`)}
                                onError={(e) => {
                                  console.error("Gagal load image:", `${API_BASE_URL}${transaction.receiptUrl}`);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <button
                                onClick={() => openImageModal(`${API_BASE_URL}${transaction.receiptUrl}`)}
                                style={{
                                  background: "#3b82f6",
                                  color: "white",
                                  border: "none",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                }}
                              >
                                Lihat Gambar
                              </button>
                            </div>
                          ) : (
                            <a
                              href={`${API_BASE_URL}${transaction.receiptUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#2563eb",
                                textDecoration: "none",
                                fontSize: "14px",
                                background: "#eff6ff",
                                padding: "10px 16px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              📄 Lihat File Struk
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    gap: "12px", 
                    marginTop: "20px",
                    flexWrap: "wrap"
                  }}>
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      style={{
                        background: currentPage === 1 ? "#e2e8f0" : "#3b82f6",
                        color: currentPage === 1 ? "#64748b" : "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Sebelumnya
                    </button>
                    
                    <span style={{ 
                      fontSize: "14px", 
                      color: "#64748b",
                      padding: "8px 12px"
                    }}>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      style={{
                        background: currentPage === totalPages ? "#e2e8f0" : "#3b82f6",
                        color: currentPage === totalPages ? "#64748b" : "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .transactions-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: flex-start;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          order: 2;
        }

        .transactions-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          order: 1;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        /* Desktop styles */
        @media (min-width: 768px) {
          .transactions-layout {
            grid-template-columns: 1fr 1.5fr;
            gap: 32px;
          }

          .form-section {
            order: 1;
          }

          .transactions-section {
            order: 2;
          }

          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}