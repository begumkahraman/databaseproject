import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. ADIM: Logoyu import et
import logo from '../assets/logo.png';

// 🔥 ARKA PLAN DESENİ (Opaklık 0.2 - Daha belirgin)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function AdminPanel() {
  const [stats, setStats] = useState({ users: [], books: [], transactions: [] });
  
  // 👇 GÜNCELLEME 1: State içine 'publisher' eklendi
  const [newBook, setNewBook] = useState({
    title: "", author: "", isbn: "", categoryName: "", publisher: "", totalQuantity: 5
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // 🔒 GÜVENLİK KONTROLÜ
    const role = localStorage.getItem('role');
    
    if (role !== 'admin') {
      alert("⛔ Bu alana sadece yöneticiler girebilir!");
      navigate('/'); 
      return; 
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/books/stats');
      setStats(response.data);
    } catch (error) {
      console.log("Veri çekme hatası:", error);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/books', newBook);
      alert("✅ Yeni Hazinen Eklendi! 🌸");
      // 👇 GÜNCELLEME 2: Form sıfırlanırken publisher da sıfırlanıyor
      setNewBook({ title: "", author: "", isbn: "", categoryName: "", publisher: "", totalQuantity: 5 });
      fetchStats(); 
    } catch (error) {
      alert("Hata: " + error.response?.data?.error);
    }
  };

  // ⭐ TÜM YÖNETİM BUTONLARI İÇİN ORTAK STİL
  const commonButtonStyle = "bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105 active:scale-95";

  return (
    // 🔥 ARKA PLAN: Powder Pink Gradient
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 font-sans text-[#D36E70]"
        style={bgPatternStyle}
    >
      
      {/* BAŞLIK ALANI */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
            <img 
                src={logo} 
                alt="Lovelace Library Logo" 
                className="h-24 w-24 object-contain drop-shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/')}
            />
            <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D36E70] to-[#E08A8C] drop-shadow-sm">
                    Yönetici Üssü
                </h1>
                <p className="text-[#D36E70]/70 font-medium ml-1">Sistemin kalbi burada atıyor.</p>
            </div>
        </div>
        
        <button 
            onClick={() => navigate('/')} 
            className="bg-[#fae6e6]/80 backdrop-blur hover:bg-[#fff0f5] text-[#D36E70] font-bold px-6 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:border-[#D36E70] transition flex items-center gap-2"
        >
          ⬅ Siteye Dön
        </button>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Kitap Kartı */}
        <div className="bg-[#fae6e6]/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-[#fff0f5] hover:scale-105 transition transform">
          <h3 className="text-[#D36E70]/70 font-bold uppercase tracking-wider text-sm mb-1">Toplam Kitap</h3>
          <p className="text-5xl font-extrabold text-[#D36E70] drop-shadow-sm">{stats.books?.length || 0}</p>
          <div className="mt-2 h-1 w-full bg-[#fff0f5] rounded-full overflow-hidden">
             <div className="h-full bg-[#D36E70] w-3/4"></div>
          </div>
        </div>

        {/* Üye Kartı */}
        <div className="bg-[#fae6e6]/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-[#fff0f5] hover:scale-105 transition transform">
          <h3 className="text-[#D36E70]/70 font-bold uppercase tracking-wider text-sm mb-1">Toplam Üye</h3>
          <p className="text-5xl font-extrabold text-[#D36E70] drop-shadow-sm">{stats.users?.length || 0}</p>
          <div className="mt-2 h-1 w-full bg-[#fff0f5] rounded-full overflow-hidden">
             <div className="h-full bg-[#D36E70] w-1/2"></div>
          </div>
        </div>

        {/* İşlem Kartı */}
        <div className="bg-[#fae6e6]/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-[#fff0f5] hover:scale-105 transition transform">
          <h3 className="text-[#D36E70]/70 font-bold uppercase tracking-wider text-sm mb-1">Son Hareketler</h3>
          <p className="text-5xl font-extrabold text-[#D36E70] drop-shadow-sm">{stats.transactions?.length || 0}</p>
          <div className="mt-2 h-1 w-full bg-[#fff0f5] rounded-full overflow-hidden">
             <div className="h-full bg-[#D36E70] w-2/3"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* KİTAP EKLEME FORMU */}
        <div className="bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5]">
          <h2 className="text-2xl font-bold mb-6 text-[#D36E70] flex items-center gap-2">
            📚 Hızlı Kitap Ekle
          </h2>
          <form onSubmit={handleAddBook} className="space-y-4">
            
            {/* Satır 1: Kitap Adı */}
            <input 
              type="text" placeholder="Kitap Adı" required 
              className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
              value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
            />

            {/* Satır 2: Yazar ve Yayınevi (YAN YANA) */}
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Yazar" required 
                className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
                value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})}
              />
               {/* 👇 GÜNCELLEME 3: Yayınevi Inputu Eklendi */}
              <input 
                type="text" placeholder="Yayınevi" 
                className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
                value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})}
              />
            </div>

            {/* Satır 3: ISBN ve Kategori */}
            <div className="grid grid-cols-2 gap-4">
               <input 
                type="text" placeholder="ISBN" required 
                className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
                value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})}
              />
               <input 
                type="text" placeholder="Kategori (Örn: Roman)" required 
                className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
                value={newBook.categoryName} onChange={e => setNewBook({...newBook, categoryName: e.target.value})}
              />
            </div>

            {/* Satır 4: Adet */}
            <input 
                type="number" min="1" placeholder="Adet" required 
                className="w-full p-4 rounded-xl bg-[#FFF0F5] border border-[#D36E70]/30 focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition"
                value={newBook.totalQuantity} onChange={e => setNewBook({...newBook, totalQuantity: e.target.value})}
            />

            <button className={commonButtonStyle}>
                Kaydet ve Yayınla ✨
            </button>
          </form>
        </div>

        {/* HAREKET LİSTESİ BUTONU */}
        <div className="bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5] flex flex-col justify-center items-center text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2 text-[#D36E70]">Canlı Akış ve İşlemler</h2>
            <p className="text-[#D36E70]/70 mb-6">Tüm ödünç alma ve iade işlemlerini detaylı inceleyin.</p>
            <button 
                onClick={() => navigate('/transactions')}
                className={commonButtonStyle}
            >
                Tüm İşlemleri Gör ➡️
            </button>
        </div>

      </div>

      {/* ALT BÖLÜM: YÖNETİM BUTONLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* KİTAP YÖNETİMİ BUTONU */}
        <div className="bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5] flex flex-col justify-center items-center text-center hover:scale-[1.02] transition duration-300">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold mb-2 text-[#D36E70]">Kütüphane Arşivi</h2>
            <p className="text-[#D36E70]/70 mb-6">Mevcut kitapları listeleyin, düzenleyin veya silin.</p>
            <button 
                onClick={() => navigate('/admin/books')}
                className={commonButtonStyle}
            >
                Kitapları Yönet 🛠️
            </button>
        </div>

        {/* ÜYE YÖNETİMİ BUTONU */}
        <div className="bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5] flex flex-col justify-center items-center text-center hover:scale-[1.02] transition duration-300">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2 text-[#D36E70]">Üye Kadrosu</h2>
            <p className="text-[#D36E70]/70 mb-6">Kayıtlı üyeleri ve yetkilerini görüntüleyin.</p>
            <button 
                onClick={() => navigate('/admin/users')}
                className={commonButtonStyle}
            >
                Üyeleri Listele 👤
            </button>
        </div>

      </div>

    </div>
  );
}