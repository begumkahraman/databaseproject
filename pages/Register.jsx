// React hook for local component state
import { useState } from 'react';

// Axios for HTTP requests
import axios from 'axios';

// Navigation and linking utilities from React Router
import { useNavigate, Link } from 'react-router-dom';

// 🔥 BACKGROUND PATTERN STYLE (consistent with other pages - opacity 0.2)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

// Register page component
export default function Register() {

  // State to store registration form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminKey: '' 
  });

  // Navigation helper
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send registration request to backend
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      
      alert('✅ ' + response.data.message); 

      // Redirect to login page after successful registration
      navigate('/login');

    } catch (error) {
      console.error(error);
      alert('❌ Hata: ' + (error.response?.data?.error || 'Kayıt başarısız.'));
    }
  };

  return (
    // 🔥 MAIN BACKGROUND CONTAINER
    <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] font-sans relative text-[#D36E70]"
        // Apply SVG background pattern
        style={bgPatternStyle}
    >
      
      {/* BACK TO HOME BUTTON */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 text-[#D36E70] hover:text-[#E08A8C] font-bold flex items-center text-lg transition bg-[#fae6e6]/50 px-4 py-2 rounded-full border border-[#D36E70]/20"
      >
        ⬅ Ana Sayfa
      </button>

      {/* REGISTRATION CARD CONTAINER */}
      <div className="bg-[#fae6e6]/90 backdrop-blur-md rounded-3xl shadow-2xl w-96 overflow-hidden border border-[#fff0f5] p-8">
        
        {/* Card header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">✨</div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D36E70] to-[#E08A8C]">
            Aramıza Katıl
          </h2>
          <p className="text-[#D36E70]/70 text-sm mt-2">
            Kütüphane dünyasına adım at.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name input */}
          <input 
            name="name" 
            type="text" 
            placeholder="Adın Soyadın" 
            onChange={handleChange} 
            required 
            className="w-full p-4 bg-[#FFF0F5] border border-[#D36E70]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition" 
          />

          {/* Email input */}
          <input 
            name="email" 
            type="email" 
            placeholder="E-posta Adresi" 
            onChange={handleChange} 
            required 
            className="w-full p-4 bg-[#FFF0F5] border border-[#D36E70]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition" 
          />

          {/* Password input */}
          <input 
            name="password" 
            type="password" 
            placeholder="Şifre Belirle" 
            onChange={handleChange} 
            required 
            className="w-full p-4 bg-[#FFF0F5] border border-[#D36E70]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 transition" 
          />

          {/* ADMIN KEY INPUT (OPTIONAL) */}
          <div className="pt-2">
            <input 
              name="adminKey" 
              type="password" 
              placeholder="Yönetici Kodu (Varsa)" 
              onChange={handleChange} 
              className="w-full p-3 bg-[#fff0f5] border border-[#D36E70]/30 border-dashed rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D36E70] text-[#D36E70] placeholder-[#D36E70]/50 text-sm text-center transition hover:bg-white" 
            />
            <p className="text-[10px] text-center text-[#D36E70]/60 mt-1">
              *Sadece yöneticiler içindir, boş bırakabilirsiniz.
            </p>
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="w-full text-white py-3 rounded-xl font-bold text-lg shadow-lg bg-gradient-to-r from-[#D36E70] to-[#E08A8C] shadow-[#D36E70]/20 hover:scale-[1.02] transition transform active:scale-95"
          >
            Kayıt Ol ✨
          </button>
        </form>

        {/* Login redirect link */}
        <p className="mt-6 text-center text-sm text-[#D36E70]/80">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="font-bold text-[#D36E70] hover:underline hover:text-[#B55E75]">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );

}
