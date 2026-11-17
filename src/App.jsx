import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  User, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Wifi, 
  WifiOff, 
  Download, 
  Cpu, 
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

// Data awal (Seed Data) jika penyimpanan lokal masih kosong
const INITIAL_ITEMS = [
  { id: 1, name: 'ESP32-S3 WROOM-1', category: 'Mikrokontroler', stock: 5, location: 'Rak A1' },
  { id: 2, name: 'Sensor DHT11', category: 'Sensor', stock: 12, location: 'Rak B2' },
  { id: 3, name: 'Rotary Encoder EC11', category: 'Input', stock: 2, location: 'Rak A3' },
  { id: 4, name: 'OLED Display 0.96" I2C', category: 'Display', stock: 4, location: 'Rak C1' },
];

export default function App() {
  // State Navigasi Halaman ('home' | 'inventory' | 'profile')
  const [activeTab, setActiveTab] = useState('home');

  // State Status Online/Offline & PWA Install Prompt
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // State Data Inventaris (CRUD) dengan persistensi LocalStorage (Offline-ready)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('techgear_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  // State Pencarian & Modal Form CRUD
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mikrokontroler',
    stock: 1,
    location: ''
  });

  // State Data Profil (Dapat disesuaikan langsung)
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('techgear_profile');
    return savedProfile ? JSON.parse(savedProfile) : {
      nama: 'Bernard Ivan Salim',
      nim: '21120123140000', // Silakan sesuaikan dengan NIM Anda
      kelompok: 'Kelompok 06',
      jurusan: 'Teknik Komputer'
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Simpan perubahan items ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('techgear_items', JSON.stringify(items));
  }, [items]);

  // Simpan perubahan profil ke localStorage
  useEffect(() => {
    localStorage.setItem('techgear_profile', JSON.stringify(profile));
  }, [profile]);

  // Listener status koneksi & event beforeinstallprompt PWA
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Fungsi memicu instalasi PWA
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // --- OPERASI CRUD ---
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'Mikrokontroler', stock: 1, location: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock,
      location: item.location
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      // UPDATE
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, stock: Number(formData.stock) } 
          : item
      ));
    } else {
      // CREATE
      const newItem = {
        id: Date.now(),
        ...formData,
        stock: Number(formData.stock)
      };
      setItems([newItem, ...items]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    // DELETE
    setItems(items.filter(item => item.id !== id));
  };

  // Filter Pencarian
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistik untuk Halaman Beranda
  const totalJenis = items.length;
  const totalStok = items.reduce((acc, item) => acc + item.stock, 0);
  const stokMenipis = items.filter(item => item.stock <= 3);

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {/* HEADER / TOP BAR */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-lg">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">TechGear PWA</h1>
              <p className="text-xs text-blue-100">Inventaris Komponen Praktikum</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Install PWA (Muncul jika browser mendukung & belum terinstall) */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-white text-blue-600 px-3 py-1.5 rounded-full text-xs font-semibold shadow hover:bg-blue-50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}

            {/* Indikator Status Online / Offline */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' : 'bg-amber-500/30 text-amber-100 border border-amber-400/40'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Navigasi Desktop */}
        <nav className="hidden md:block bg-blue-700/60 border-t border-blue-500/40">
          <div className="max-w-4xl mx-auto px-4 flex gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'home' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" /> Beranda
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'inventory' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Data Inventaris (CRUD)
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2.5 px-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'profile' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Profil Mahasiswa
            </button>
          </div>
        </nav>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        
        {/* ================= HALAMAN 1: BERANDA ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">

            {/* Kartu Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase">Jenis Komponen</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalJenis}</p>
                <p className="text-xs text-slate-400 mt-1">Item terdaftar</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase">Total Unit Stok</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{totalStok}</p>
                <p className="text-xs text-slate-400 mt-1">Unit tersedia</p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase">Stok Menipis (≤3)</p>
                <p className="text-3xl font-bold text-amber-500 mt-1">{stokMenipis.length}</p>
                <p className="text-xs text-slate-400 mt-1">Perlu restock segera</p>
              </div>
            </div>

            {/* Peringatan Stok Menipis */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Perhatian Stok Menipis
                </h3>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Kelola Semua →
                </button>
              </div>

              {stokMenipis.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  Semua stok komponen dalam kondisi aman!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stokMenipis.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category} • {item.location}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Sisa: {item.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= HALAMAN 2: INVENTARIS (CRUD) ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Daftar Komponen</h2>
                <p className="text-xs text-slate-500">Tambah, ubah, atau hapus data inventaris</p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Tambah Komponen
              </button>
            </div>

            {/* Kolom Pencarian */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama komponen, kategori, atau lokasi rak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* List Data Komponen */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">Tidak ada komponen ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Silakan tambah data baru atau ubah kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-semibold rounded-md">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-800">{item.name}</h3>
                      <p className="text-xs text-slate-500">
                        Lokasi: <span className="font-medium text-slate-700">{item.location || '-'}</span> • 
                        Stok: <span className={`font-bold ${item.stock <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>{item.stock} unit</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit Komponen"
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Hapus Komponen"
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= HALAMAN 3: PROFIL ================= */}
        {activeTab === 'profile' && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4 flex justify-between items-end">
                <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md">
                  <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {profile.nama.charAt(0)}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  {isEditingProfile ? 'Selesai' : 'Edit Profil'}
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profile.nama}
                      onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NIM</label>
                    <input
                      type="text"
                      value={profile.nim}
                      onChange={(e) => setProfile({ ...profile, nim: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kelompok</label>
                    <input
                      type="text"
                      value={profile.kelompok}
                      onChange={(e) => setProfile({ ...profile, kelompok: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{profile.nama}</h2>
                    <p className="text-sm text-slate-500">{profile.jurusan}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400">NIM</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.nim}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400">Kelompok</p>
                      <p className="font-semibold text-blue-600 text-sm mt-0.5">{profile.kelompok}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-800">
                    <p className="font-semibold mb-1">Status Progressive Web App (PWA):</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                      <li>Service Worker & Offline Caching Aktif</li>
                      <li>Penyimpanan Lokal (LocalStorage) Tersinkronisasi</li>
                      <li>Siap di-install di Desktop maupun Mobile</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR (Mobile-First) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-xs font-medium ${
            activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          Beranda
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-xs font-medium ${
            activeTab === 'inventory' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5" />
          Inventaris
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-xs font-medium ${
            activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          Profil
        </button>
      </nav>

      {/* MODAL FORM TAMBAH / EDIT (CRUD) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingItem ? 'Edit Komponen' : 'Tambah Komponen Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Komponen *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arduino Uno R3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Mikrokontroler">Mikrokontroler</option>
                    <option value="Sensor">Sensor</option>
                    <option value="Input">Input / Switch</option>
                    <option value="Display">Display</option>
                    <option value="Modul Daya">Modul Daya</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Stok *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  placeholder="Contoh: Box Komponen B2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}