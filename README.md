## MoneyTrack - Personal Budget Management System

Maritza Adelia Sucipto
NRP: 5027241111

## Tentang Aplikasi
MoneyTrack adalah aplikasi web untuk mengelola keuangan pribadi yang membantu pengguna dalam melakukan budget controlling dan tracking pemasukan-pengeluaran. Aplikasi ini dirancang untuk memberikan kontrol penuh atas keuangan dengan antarmuka yang user-friendly dan fitur-fitur lengkap.

## Fitur Utama
- Dashboard
Rangkuman keuangan untuk setiap kategori pengeluaran
Visualisasi grafik untuk pemasukan dan pengeluaran
Progress bar untuk monitoring budget per kategori
Quick overview kondisi keuangan bulanan

- Manajemen Transaksi
Tambah pemasukan dengan detail kategori
Tambah pengeluaran dengan tracking lengkap
Upload bukti transaksi (foto struk/kwitansi)
Kategorisasi otomatis transaksi
Riwayat transaksi dengan filter tanggal

- Budget Controlling
Set budget bulanan per kategori
Monitoring real-time penggunaan budget
Alert notifikasi ketika mendekati limit budget
Fleksibel update budget kapan saja

- Tabungan & Investasi
Target menabung dengan timeline
Pemantauan perkembangan tabungan

## Teknologi yang Digunakan
### Frontend
- React.js - UI Framework
- CSS3 - Styling dan responsive design
- Chart.js - Data visualization
- Axios - HTTP client

### Backend
- Node.js - Runtime environment
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM untuk MongoDB
- JWT - Authentication

## Cara Menjalankan
Prerequisites
Node.js (v14 atau lebih tinggi)
MongoDB
npm atau yarn

## Installation

### Clone repository
git clone [repository-url]
cd moneytrack
npm create vite@latest frontend -- --template react

### Install dependencies backend
cd backend
npm install

### Install dependencies frontend  
cd ../frontend
npm install

### Running the Application

### Jalankan backend (port 5000)
cd backend
npm run dev

### Jalankan frontend (port 5173)  
cd frontend
npm install react-router-dom
npx tailwindcss init -p
npm install -D tailwindcss postcss autoprefixer
npm install axios   
npm run dev

Akses aplikasi di: http://localhost:5173

## Video Demo
[![Demo MoneyTrack](https://img.youtube.com/vi/8AfG70uA2u0/0.jpg)](https://youtu.be/8AfG70uA2u0)
