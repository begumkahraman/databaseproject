import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🔥 ARKA PLAN DESENİ (Opaklığı tekrar dengeledik)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function MyBooks() {
  const [myBooks, setMyBooks] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/books/my-books/${userId}`);
      setMyBooks(response.data);
    } catch (error) {
      console.error("Hata", error);
    }
  };

  const handleReturn = async (bookId) => {
    if (!confirm("Bu kitabı iade etmek istediğinize emin misiniz?")) return;

    try {
      await axios.post('http://localhost:3000/api/books/return', {
        userId: parseInt(userId),
        bookId: bookId
      });
      alert("✅ Kitap başarıyla iade edildi! Teşekkürler. 🌸");
      fetchMyBooks(); 
    } catch (error) {
      alert("❌ Hata oluştu");
    }
  };

  return (
    // 🔥 ARKA PLAN: Powder Pink Gradient
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 relative font-sans text-[#D36E70]"
        style={bgPatternStyle}
    >
      
      {/* GERİ DÖN BUTONU - Kutu rengi koyulaştırıldı (#fae6e6) */}
      <button 
        onClick={() => navigate('/books')} 
        className="absolute top-6 left-6 bg-[#fae6e6] backdrop-blur text-[#D36E70] hover:bg-[#f5d0d0] font-bold flex items-center px-4 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:border-[#D36E70] transition z-20"
      >
        ⬅ Kitap Listesi
      </button>

      <div className="max-w-4xl mx-auto mt-12 relative z-10">
        {/* BAŞLIK ALANI */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#D36E70] mb-2 drop-shadow-sm">
                Merhaba, {userName} 👋
            </h1>
            {/* Bilgi kutucuğu rengi koyulaştırıldı (#fae6e6) */}
            <p className="text-[#D36E70]/90 font-medium bg-[#fae6e6]/80 inline-block px-4 py-1 rounded-full border border-[#D36E70]/20">
                Şu an elinde bulunan hazineler aşağıdadır.
            </p>
        </div>

        {myBooks.length === 0 ? (
          // --- BOŞ DURUM (BORÇ YOK) ---
          // Arka plan rengi bg-[#fae6e6] yapıldı (Daha koyu beyaz/pembe)
          <div className="bg-[#fae6e6]/80 backdrop-blur p-12 rounded-3xl shadow-lg text-center border-4 border-[#D36E70]/20 border-dashed animate-fade-in-up">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <p className="text-2xl font-bold text-[#D36E70]">Harika! Hiç borcun yok.</p>
            <p className="text-[#D36E70]/80 mt-2 font-medium">Kütüphaneden yeni maceralara atılabilirsin.</p>
            <button 
                onClick={() => navigate('/books')} 
                className="mt-6 bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition hover:scale-105"
            >
                📚 Kitaplara Git
            </button>
          </div>
        ) : (
          // --- KİTAP LİSTESİ ---
          <div className="grid gap-6">
            {myBooks.map((item) => (
              // Kart arka planı bg-[#fae6e6] yapıldı (Daha koyu beyaz/pembe)
              <div key={item.id} className="bg-[#fae6e6]/90 backdrop-blur p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#D36E70]/20 transition duration-300 flex flex-col sm:flex-row justify-between items-center border border-[#fff0f5] hover:border-[#D36E70]/40 group">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Etiket rengi uyumlu hale getirildi */}
                    <span className="bg-[#fff0f5] text-[#D36E70] text-xs font-bold px-2 py-1 rounded-full border border-[#D36E70]/20">
                        Okunuyor 📖
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#D36E70] group-hover:text-[#E08A8C] transition">
                    {item.book.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {/* Tarih kutucukları daha belirgin hale getirildi */}
                    <p className="text-[#D36E70]/80 font-medium bg-[#fff0f5] px-3 py-1 rounded-lg border border-[#D36E70]/20">
                        📅 Alınan: <span className="text-[#D36E70] font-bold">{new Date(item.borrowDate).toLocaleDateString()}</span>
                    </p>
                    <p className="text-[#D36E70]/80 font-medium bg-[#fff0f5] px-3 py-1 rounded-lg border border-[#D36E70]/20">
                        ⏳ Son Teslim: <span className="text-[#D36E70] font-bold border-b-2 border-[#D36E70]/30">{new Date(item.dueDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-6 w-full sm:w-auto">
                  {/* İade butonu beyaz yerine desenle uyumlu hale getirildi */}
                  <button 
                    onClick={() => handleReturn(item.bookId)}
                    className="w-full sm:w-auto bg-[#fff0f5] text-[#D36E70] border-2 border-[#D36E70] px-6 py-3 rounded-xl hover:bg-[#D36E70] hover:text-white transition font-bold shadow-sm active:scale-95"
                  >
                    İade Et ↩
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}