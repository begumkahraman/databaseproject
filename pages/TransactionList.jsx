import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// 🔥 ARKA PLAN DESENİ (Diğer sayfalarla uyumlu - Opaklık 0.2)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  }, []);

  // Tarih formatını güzelleştiren fonksiyon
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    // 🔥 ARKA PLAN: Powder Pink Gradient
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 font-sans text-[#D36E70]"
        style={bgPatternStyle}
    >
      
      {/* KART YAPISI: Zemin Rengi #fae6e6 (Koyu Pudra) */}
      <div className="max-w-5xl mx-auto bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5]">
        
        {/* ÜST KISIM */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-[#D36E70] drop-shadow-sm flex items-center gap-2">
            📋 İşlem Geçmişi
          </h2>
          
          <button 
             onClick={() => navigate('/admin')}
             className="bg-[#FFF0F5] text-[#D36E70] font-bold px-6 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:bg-white transition flex items-center gap-2"
          >
             ⬅ Admin Paneline Dön
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#D36E70]/10">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* TABLO BAŞLIĞI */}
              <tr className="bg-[#FFF0F5] text-[#D36E70] uppercase text-xs font-bold tracking-wider">
                <th className="p-4 border-b border-[#D36E70]/20">Tarih</th>
                <th className="p-4 border-b border-[#D36E70]/20">Kullanıcı ID</th>
                <th className="p-4 border-b border-[#D36E70]/20">Kitap Adı</th>
                <th className="p-4 border-b border-[#D36E70]/20">İşlem Türü</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-[#fae6e6]/50">
              {transactions.map((tr) => (
                <tr key={tr.id} className="border-b border-[#D36E70]/10 hover:bg-[#FFF0F5] transition">
                  <td className="p-4 text-[#D36E70]/80 font-medium">{formatDate(tr.createdAt)}</td>
                  <td className="p-4 font-mono text-[#D36E70] font-bold">User #{tr.userId}</td>
                  <td className="p-4 font-bold text-[#D36E70]">{tr.book?.title || 'Silinmiş Kitap'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tr.type === 'BORROW' ? 'bg-[#fae6e6] text-[#D36E70] border-[#D36E70]/30' : 'bg-green-100 text-green-700 border-green-200'}`}>
                      {tr.type === 'BORROW' ? '📤 Ödünç Aldı' : '📥 İade Etti'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="text-center py-10">
                <p className="text-2xl animate-bounce mb-2">📂</p>
                <p className="text-[#D36E70]/60">Henüz hiç işlem kaydı bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}