# Panduan Workflow Edit Dua Arah (Lovable ↔ GitHub)

## ✅ Setup Selesai!

Proyek Anda sudah siap untuk diedit di kedua tempat (Lovable dan lokal/GitHub).

## 🔄 Cara Kerja Sinkronisasi

### Dari Lovable → GitHub
- Edit di Lovable otomatis akan di-commit ke GitHub
- Tidak perlu melakukan apa-apa, sinkronisasi otomatis!

### Dari Lokal → Lovable
- Edit file lokal
- Commit dan push ke GitHub
- Lovable akan otomatis sync dengan GitHub

## 📝 Workflow Rekomendasi

### Opsi 1: Edit di Lovable (Cara Termudah)
1. Buka [Lovable Project](https://lovable.dev/projects/f7ca1b92-5a35-4b7c-8e46-10def2ee654a)
2. Edit menggunakan prompt atau editor
3. Perubahan otomatis ter-commit ke GitHub
4. Jika ingin lanjut edit lokal, lakukan `git pull` di terminal

### Opsi 2: Edit Lokal (Untuk Development)
1. Buka terminal di folder proyek
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Edit file di editor favorit Anda (VS Code, dll)
4. Test perubahan di browser (localhost)
5. Commit dan push perubahan:
   ```bash
   git add .
   git commit -m "Deskripsi perubahan"
   git push origin main
   ```
6. Perubahan akan muncul di Lovable setelah beberapa saat

### Opsi 3: Kombinasi (Edit Dua Arah)
1. **Mulai dari Lovable**: Buat struktur dasar atau fitur baru
2. **Lanjutkan Lokal**: Clone dan develop lebih detail
3. **Sync berkala**: 
   - Dari Lovable: Otomatis, tidak perlu `git pull` (tapi bisa untuk aman)
   - Dari Lokal: `git push` setelah commit

## 🚀 Memulai Development Lokal

### 1. Navigasi ke folder proyek
```bash
cd pengadaan-app
```

### 2. Install dependencies (sudah dilakukan)
```bash
npm install
```

### 3. Jalankan development server
```bash
npm run dev
```

### 4. Buka browser di `http://localhost:5173`

## 📦 Perintah Git yang Berguna

### Melihat status perubahan
```bash
git status
```

### Sync dengan GitHub (ambil perubahan dari Lovable)
```bash
git pull origin main
```

### Push perubahan lokal ke GitHub
```bash
git add .
git commit -m "Deskripsi perubahan"
git push origin main
```

### Membuat branch baru untuk fitur
```bash
git checkout -b nama-fituru-baru
# ... edit file ...
git add .
git commit -m "Menambah fitur baru"
git push origin nama-fituru-baru
```

## ⚠️ Tips Penting

1. **Sebelum edit lokal, selalu pull dulu** untuk memastikan sinkron dengan Lovable:
   ```bash
   git pull origin main
   ```

2. **Jangan edit file yang sama** di Lovable dan lokal secara bersamaan (bisa konflik)

3. **Commit pesan yang jelas** agar mudah tracking perubahan

4. **Backup penting**: Karena Lovable auto-commit, pastikan push ke GitHub sebelum edit besar

## 🛠️ Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## 📚 Teknologi yang Digunakan

- **Vite** - Build tool yang cepat
- **React** - UI framework
- **TypeScript** - Type safety
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **Supabase** - Backend/Database

## ❓ Troubleshooting

### Jika ada konflik Git
```bash
git pull origin main
# Resolve conflict manually
git add .
git commit -m "Resolve conflict"
git push origin main
```

### Jika dependencies error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset ke versi GitHub
```bash
git fetch origin
git reset --hard origin/main
```

---

**Happy Coding! 🎉**

