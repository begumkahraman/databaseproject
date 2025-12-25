import { useNavigate } from 'react-router-dom';

// 1. ADIM: Logoları import et
import logo from '../assets/logo.png'; 
import logoSmall from '../assets/logo-small.png'; 

// ARKA PLAN DESENİ (Opaklık 0.2 ve Renk #D36E70)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function Home() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    // 🔥 ARKA PLAN: Powder Pink
    <div 
      className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] flex flex-col items-center justify-center relative font-sans text-[#D36E70] overflow-hidden"
      style={bgPatternStyle}
    >
      
      {/* --- HEADER (SOL ÜST LOGO) --- */}
      <div 
        className="absolute top-6 left-6 z-20 cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => window.location.reload()} 
      >
        <img 
            src={logo} 
            alt="Lovelace Library Logo" 
            className="h-48 w-48 object-contain drop-shadow-xl" 
        />
      </div>


      {/* --- SAĞ ÜST KÖŞE (Giriş/Kayıt) --- */}
      <div className="absolute top-8 right-8 flex gap-4 items-center z-20">
        {userName ? (
          <>
            {/* Hoş geldin kutusu: bg-[#fae6e6] */}
            <span className="font-medium text-[#D36E70] bg-[#fae6e6]/90 px-5 py-2 rounded-full shadow-sm backdrop-blur-md border border-[#D36E70]/20">
              Hoş geldin, <span className="font-bold">{userName}</span> 🌸
            </span>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white px-5 py-2 rounded-full font-bold transition shadow-md hover:shadow-lg active:scale-95"
            >
              Çıkış Yap 🚪
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/register')} 
              // Kayıt Ol butonu: bg-[#fae6e6]
              className="bg-[#fae6e6]/90 backdrop-blur-md text-[#D36E70] px-6 py-2 rounded-full font-bold shadow-sm hover:bg-[#fff0f5] transition border border-[#D36E70]/30 hover:border-[#D36E70] active:scale-95"
            >
              Kayıt Ol
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition shadow-sm active:scale-95"
            >
              Giriş Yap
            </button>
          </>
        )}
      </div>

      {/* --- MERKEZİ İÇERİK --- */}
      {/* Kutu Rengi: bg-[#fae6e6]/80 (Daha koyu pudra) */}
      <div className="text-center p-8 max-w-md bg-[#fae6e6]/90 backdrop-blur-xl rounded-3xl border border-[#fff0f5] shadow-2xl animate-fade-in-up mt-12 z-10 relative">
        
        {/* --- ORTADAKİ LOGO --- */}
        <div className="flex justify-center mb-4 drop-shadow-md">
            <img 
                src={logoSmall} 
                alt="Lovelace Small Logo" 
                className="h-36 w-auto object-contain" 
            />
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-extrabold mb-3 text-[#D36E70] drop-shadow-sm tracking-tight">
          Kütüphane Sistemi
        </h1>
        
        {/* Açıklama */}
        <p className="text-base text-[#D36E70]/80 mb-6 font-medium leading-relaxed">
          Bilginin ve zarafetin buluşma noktasına hoş geldiniz. <br/> 
          Keyifli okumalar dileriz. ✨
        </p>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => navigate('/books')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition transform active:scale-95"
          >
            📖 Kitapları İncele
          </button>

          {role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              // Admin Butonu: bg-[#FFF0F5]
              className="px-6 py-2.5 bg-[#FFF0F5]/80 backdrop-blur-md text-[#D36E70] border-2 border-[#D36E70]/30 rounded-2xl font-bold text-sm shadow-md hover:bg-white hover:border-[#D36E70] hover:scale-105 transition transform active:scale-95"
            >
              🛡️ Admin Paneli
            </button>
          )}
        </div>
      </div>

      {/* ALT BİLGİ */}
      <div className="absolute bottom-6 text-[#D36E70]/70 text-sm font-semibold flex items-center gap-1 z-10">
        <span>© 2025 Lovelace Kütüphanesi</span>
      </div>

    </div>
  );
}