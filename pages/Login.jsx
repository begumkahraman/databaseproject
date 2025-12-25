import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 🔥 ARKA PLAN DESENİ (Diğer sayfalarla uyumlu - Opaklık 0.2)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function Login() {
  const [activeTab, setActiveTab] = useState('user'); 
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      const { role, name, userId, token } = response.data;

      // Yönetici kontrolü
      if (activeTab === 'admin' && role !== 'admin') {
        alert("⛔ HATA: Bu hesap yönetici yetkisine sahip değil!");
        return; 
      }

      // Verileri kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('role', role);

      alert(`🌸 Hoş geldin ${name}! Giriş başarılı.`);

      if (activeTab === 'admin') {
        navigate('/admin');
      } else {
        navigate('/books');
      }

    } catch (error) {
      console.error(error);
      alert('❌ Hata: E-posta veya şifre yanlış.');
    }
  };

  return (
    // 🔥 ARKA PLAN: Powder Pink Gradient
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] font-sans text-[#D36E70]"
      style={bgPatternStyle}
    >
      
      {/* GERİ DÖN BUTONU */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 text-[#D36E70] hover:text-[#E08A8C] font-bold flex items-center text-lg transition bg-[#fae6e6]/50 px-4 py-2 rounded-full border border-[#D36E70]/20"
      >
        ⬅ Ana Sayfa
      </button>

      {/* KART YAPISI: Zemin Rengi #fae6e6 (Koyu Pudra) */}
      <div className="bg-[#fae6e6]/90 backdrop-blur-md rounded-3xl shadow-2xl w-96 overflow-hidden border border-[#fff0f5]">
        
        {/* SEKME BAŞLIKLARI */}
        <div className="flex text-center font-bold cursor-pointer">
          <div 
            onClick={() => setActiveTab('user')}
            className={`w-1/2 py-4 transition-all duration-300 ${
                activeTab === 'user' 
                ? 'bg-[#D36E70] text-white shadow-inner' // Aktif: Mercan
                : 'bg-[#fff0f5] text-[#D36E70]/60 hover:bg-[#ffe4e6] hover:text-[#D36E70]' // Pasif: Açık
            }`}
          >
            👤 Üye
          </div>
          <div 
            onClick={() => setActiveTab('admin')}
            className={`w-1/2 py-4 transition-all duration-300 ${
                activeTab === 'admin' 
                ? 'bg-[#B55E75] text-white shadow-inner' // Aktif: Biraz daha koyu ton
                : 'bg-[#fff0f5] text-[#D36E70]/60 hover:bg-[#ffe4e6] hover:text-[#D36E70]'
            }`}
          >
            🛡️ Yönetici
          </div>
        </div>

        <div className="p-8">
          <h2 className={`text-2xl font-extrabold mb-2 text-center text-[#D36E70]`}>
            {activeTab === 'admin' ? 'Yönetici Girişi' : 'Tekrar Hoş Geldiniz'}
          </h2>
          <p className="text-center text-[#D36E70]/70 mb-6 text-sm">
            Kütüphaneye erişmek için giriş yapın.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                name="email" 
                type="email" 
                placeholder="E-posta Adresi" 
                onChange={handleChange} 
                required 
                className="w-full p-4 bg-[#FFF0F5] border border-[#D36E70]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition" 
              />
            </div>
            <div>
              <input 
                name="password" 
                type="password" 
                placeholder="Şifre" 
                onChange={handleChange} 
                required 
                className="w-full p-4 bg-[#FFF0F5] border border-[#D36E70]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition" 
              />
            </div>
            
            <button 
              type="submit" 
              className={`w-full text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition transform active:scale-95 bg-gradient-to-r from-[#D36E70] to-[#E08A8C] shadow-[#D36E70]/20`}
            >
              {activeTab === 'admin' ? 'Panele Gir 🚀' : 'Giriş Yap 🌸'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#D36E70]/80">
            Hesabın yok mu? <Link to="/register" className="font-bold text-[#D36E70] hover:underline hover:text-[#B55E75]">Hemen Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}