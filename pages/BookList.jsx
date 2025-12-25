import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 1. ADIM: Logoyu import et
import logo from '../assets/logo.png';

// 🔥 ARKA PLAN DESENİ
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü"); 
  const navigate = useNavigate();
  
  const currentUserId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error("Hata", error);
    }
  };

  const categories = [
    ...new Map(books.map(book => [book.category?.name, book.category])).values()
  ].filter(c => c !== undefined && c !== null);

  const getCategoryCount = (catId) => {
    if (catId === "Tümü") return books.length;
    return books.filter(b => b.categoryId === catId).length;
  };

  const handleBorrow = async (bookId) => {
    if (!currentUserId) {
      alert("⚠️ Lütfen önce giriş yapın!");
      navigate('/login');
      return;
    }
    try {
      await axios.post('http://localhost:3000/api/books/borrow', {
        userId: parseInt(currentUserId),
        bookId: bookId
      });
      alert("✅ Kitap keyifle ödünç alındı! 🌸");
      fetchBooks();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.error || "İşlem başarısız"));
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || book.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    // 🔥 ARKA PLAN
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 relative font-sans text-[#D36E70]"
        style={bgPatternStyle}
    > 
      
      {/* ÜST MENÜ (HEADER) */}
      <div className="bg-[#fae6e6]/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#D36E70]/20 flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-4 z-20">
        
        {/* --- LOGO VE BAŞLIK --- */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <img 
              src={logo} 
              alt="Lovelace Library Logo" 
              className="h-14 w-14 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="hidden md:block">
              <h1 className="text-xl font-extrabold text-[#D36E70] leading-none">Lovelace</h1>
              <span className="text-xs text-[#D36E70]/70 font-medium tracking-widest">KÜTÜPHANESİ</span>
          </div>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="flex-1 w-full md:w-auto mx-4">
          <input 
            type="text" 
            placeholder="🔍 Kitap veya yazar ara..." 
            className="w-full bg-[#FFF0F5] border border-[#D36E70]/30 rounded-full px-6 py-3 text-[#D36E70] placeholder-[#D36E70]/50 focus:outline-none focus:ring-2 focus:ring-[#D36E70] transition shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* BUTONLAR */}
        <div className="flex gap-3 items-center">
            {role === 'admin' && (
              <Link to="/admin" className="bg-[#FFF0F5] text-[#D36E70] px-4 py-2 rounded-full font-bold hover:bg-white transition text-sm border border-[#D36E70]/30">
                🛠️ Panel
              </Link>
            )}

            <button onClick={() => navigate('/my-books')} className="bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white px-5 py-2 rounded-full font-bold hover:shadow-lg transition transform hover:-translate-y-0.5 border border-[#D36E70]/20">
              📚 Kitaplarım
            </button>
            
            {currentUserId ? (
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-[#FFF0F5] text-[#D36E70] px-5 py-2 rounded-full font-bold hover:bg-white transition border border-[#D36E70]/30">
                 Çıkış
               </button>
            ) : (
              <button onClick={() => navigate('/login')} className="bg-[#FFF0F5] text-[#D36E70] border border-[#D36E70] px-5 py-2 rounded-full font-bold hover:bg-white transition shadow-md">
                Giriş
              </button>
            )}
        </div>
      </div>

      {/* --- KATEGORİ MENÜSÜ --- */}
      <div className="flex overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide snap-x">
        <button 
          onClick={() => setSelectedCategory("Tümü")}
          className={`flex-shrink-0 min-w-[160px] p-4 rounded-2xl shadow-md transition transform hover:scale-105 text-left border snap-start ${
            selectedCategory === "Tümü" 
            ? 'bg-[#D36E70] text-white border-[#D36E70] ring-4 ring-[#D36E70]/20' 
            : 'bg-[#fae6e6]/90 text-[#D36E70] border-[#D36E70]/20 hover:border-[#D36E70]/50'
          }`}
        >
          <div className="text-sm opacity-80 mb-1 font-medium">Koleksiyon</div>
          <div className="text-xl font-bold">Tümü</div>
          <div className="text-xs mt-2 opacity-75 font-semibold">{getCategoryCount("Tümü")} Kitap</div>
        </button>

        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 min-w-[180px] p-4 rounded-2xl shadow-md transition transform hover:scale-105 text-left border snap-start ${
              selectedCategory === cat.id 
                ? 'bg-[#E08A8C] text-white border-[#E08A8C] ring-4 ring-[#E08A8C]/20' 
                : 'bg-[#fae6e6]/90 text-[#D36E70] border-[#D36E70]/20 hover:border-[#D36E70]/50'
            }`}
          >
            <div className="text-sm opacity-80 mb-1 font-medium">Kategori</div>
            <div className="text-lg font-bold truncate">{cat.name}</div>
            <div className="text-xs mt-2 opacity-75 font-semibold">{getCategoryCount(cat.id)} Kitap</div>
          </button>
        ))}
      </div>

      {/* --- KİTAP LİSTESİ --- */}
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-[#D36E70] mb-6 flex items-center gap-3 drop-shadow-sm">
          {selectedCategory === "Tümü" 
            ? "🌸 Tüm Eserler" 
            : `🌸 ${categories.find(c => c.id === selectedCategory)?.name || 'Seçili Kategori'}`}
          <span className="text-sm font-bold text-white bg-[#D36E70] px-3 py-1 rounded-full shadow-md">
            {filteredBooks.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-[#fae6e6]/90 backdrop-blur p-6 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[#D36E70]/20 transition duration-300 flex flex-col justify-between group border border-[#fff0f5] hover:border-[#D36E70]/40">
                <div>
                  <span className="inline-block bg-[#FFF0F5] text-[#D36E70] text-[10px] px-3 py-1 rounded-full mb-3 font-bold uppercase tracking-widest border border-[#D36E70]/20">
                    {book.category?.name || "GENEL"}
                  </span>
                  
                  <h3 className="text-xl font-bold text-[#D36E70] mb-2 group-hover:text-[#E08A8C] transition leading-tight">{book.title}</h3>
                  
                  {/* Yazar ve Yayınevi Bilgisi */}
                  <div className="space-y-1 mb-4">
                     <p className="text-[#D36E70]/70 text-sm font-medium flex items-center gap-1">
                        ✍️ {book.author}
                     </p>
                     
                     {/* Yayınevi Eklendi (Varsa göster) */}
                     {book.publisher && book.publisher !== "Bilinmiyor" && (
                        <p className="text-[#D36E70]/60 text-xs font-medium flex items-center gap-1">
                           🏢 {book.publisher}
                        </p>
                     )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#D36E70]/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${book.inventory?.available > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                      {book.inventory?.available > 0 ? 'Stokta Var' : 'Tükendi'}
                    </span>
                    <span className="text-[#D36E70]/60 text-xs font-bold">
                      Stok: {book.inventory?.available}
                    </span>
                  </div>

                  {book.inventory?.available > 0 ? (
                    <button 
                      onClick={() => handleBorrow(book.id)}
                      className="w-full bg-[#D36E70] text-white py-3 rounded-xl hover:bg-[#C55D5F] transition font-bold shadow-lg shadow-[#D36E70]/20 active:scale-95 border-b-4 border-[#A34D4F] hover:border-[#8E3F41]"
                    >
                      Ödünç Al
                    </button>
                  ) : (
                    <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl cursor-not-allowed font-bold border-2 border-gray-300">
                      Tükendi 😔
                    </button>
                  )}

                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-[#fae6e6]/80 backdrop-blur rounded-3xl border-4 border-[#D36E70]/20 border-dashed">
              <div className="text-6xl mb-4 animate-bounce">🌸</div>
              <p className="text-2xl text-[#D36E70] font-bold mb-2">Eyvah!</p>
              <p className="text-[#D36E70]/80">Aradığın kitap henüz buraya uğramamış.</p>
              <button onClick={() => {setSearchTerm(""); setSelectedCategory("Tümü")}} className="mt-6 bg-white text-[#D36E70] px-6 py-2 rounded-full font-bold shadow-md hover:bg-[#FFF0F5] transition border border-[#D36E70]/30">
                Tüm Kitapları Göster
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}