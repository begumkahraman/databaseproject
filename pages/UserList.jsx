import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Sadece kullanıcı listesini çeken bir API endpoint'i (Stats endpointinden de alabilirsin)
    axios.get('http://localhost:3000/api/books/stats') // Stats içinde users var
      .then(res => setUsers(res.data.users))
      .catch(err => console.error(err));
  }, []);

  return (
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 font-sans text-[#D36E70]"
        style={bgPatternStyle}
    >
      <div className="max-w-5xl mx-auto bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5]">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#D36E70] drop-shadow-sm flex items-center gap-2">
            👥 Üye Listesi
          </h2>
          <button 
             onClick={() => navigate('/admin')}
             className="bg-[#FFF0F5] text-[#D36E70] font-bold px-6 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:bg-white transition"
          >
             ⬅ Admin Paneline Dön
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#D36E70]/10">
          <table className="w-full text-left">
            <thead className="bg-[#FFF0F5] text-[#D36E70] uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b border-[#D36E70]/20">ID</th>
                <th className="p-4 border-b border-[#D36E70]/20">Ad Soyad</th>
                <th className="p-4 border-b border-[#D36E70]/20">E-posta</th>
                <th className="p-4 border-b border-[#D36E70]/20">Yetki</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-[#fae6e6]/50">
              {users.map(user => (
                <tr key={user.id} className="border-b border-[#D36E70]/10 hover:bg-[#FFF0F5] transition">
                  <td className="p-4 font-bold text-[#D36E70]/50">#{user.id}</td>
                  <td className="p-4 font-bold text-[#D36E70]">{user.name}</td>
                  <td className="p-4 text-[#D36E70]/80">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-[#FFF0F5] text-[#D36E70] border border-[#D36E70]/20' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
                      {user.role === 'admin' ? 'YÖNETİCİ 🛡️' : 'ÜYE 👤'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}