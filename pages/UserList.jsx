// React hooks for lifecycle and state management
import { useEffect, useState } from 'react';

// Axios for making HTTP requests
import axios from 'axios';

// Navigation utility from React Router
import { useNavigate } from 'react-router-dom';

// BACKGROUND PATTERN STYLE (SVG pattern with soft opacity)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

// Component that displays the list of registered users
export default function UserList() {

  // State to store user list
  const [users, setUsers] = useState([]);

  // Navigation helper
  const navigate = useNavigate();

  // Fetch user list when component mounts
  useEffect(() => {
    // API endpoint that returns statistics including users
    axios.get('http://localhost:3000/api/books/stats')
      .then(res => setUsers(res.data.users))
      .catch(err => console.error(err));
  }, []);

  return (
    // MAIN BACKGROUND CONTAINER
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 font-sans text-[#D36E70]"
        // Apply background SVG pattern
        style={bgPatternStyle}
    >
      {/* MAIN CARD CONTAINER */}
      <div className="max-w-5xl mx-auto bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5]">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#D36E70] drop-shadow-sm flex items-center gap-2">
            👥 Üye Listesi
          </h2>

          {/* Back to admin panel button */}
          <button 
             onClick={() => navigate('/admin')}
             className="bg-[#FFF0F5] text-[#D36E70] font-bold px-6 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:bg-white transition"
          >
             ⬅ Admin Paneline Dön
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="overflow-x-auto rounded-2xl border border-[#D36E70]/10">
          <table className="w-full text-left">

            {/* TABLE HEADER */}
            <thead className="bg-[#FFF0F5] text-[#D36E70] uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b border-[#D36E70]/20">ID</th>
                <th className="p-4 border-b border-[#D36E70]/20">Ad Soyad</th>
                <th className="p-4 border-b border-[#D36E70]/20">E-posta</th>
                <th className="p-4 border-b border-[#D36E70]/20">Yetki</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="text-sm bg-[#fae6e6]/50">
              {users.map(user => (
                // User row
                <tr 
                  key={user.id} 
                  className="border-b border-[#D36E70]/10 hover:bg-[#FFF0F5] transition"
                >
                  {/* User ID */}
                  <td className="p-4 font-bold text-[#D36E70]/50">
                    #{user.id}
                  </td>

                  {/* User full name */}
                  <td className="p-4 font-bold text-[#D36E70]">
                    {user.name}
                  </td>

                  {/* User email */}
                  <td className="p-4 text-[#D36E70]/80">
                    {user.email}
                  </td>

                  {/* User role badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-[#FFF0F5] text-[#D36E70] border border-[#D36E70]/20'
                          : 'bg-gray-200 text-gray-500 border border-gray-300'
                      }`}
                    >
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
