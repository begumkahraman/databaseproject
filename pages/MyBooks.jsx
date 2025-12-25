// React hooks for state management and side effects
import { useState, useEffect } from 'react';

// Axios for HTTP requests
import axios from 'axios';

// Navigation helper from React Router
import { useNavigate } from 'react-router-dom';

// 🔥 BACKGROUND PATTERN STYLE (opacity balanced for readability)
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

// Component that displays books borrowed by the current user
export default function MyBooks() {

  // State to store user's borrowed books
  const [myBooks, setMyBooks] = useState([]);

  // Navigation helper
  const navigate = useNavigate();

  // Retrieve user information from localStorage
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchMyBooks();
  }, []);

  // Fetch borrowed books of the current user
  const fetchMyBooks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/books/my-books/${userId}`);
      setMyBooks(response.data);
    } catch (error) {
      console.error("Hata", error);
    }
  };

  // Handle book return action
  const handleReturn = async (bookId) => {

    // Ask for confirmation before returning the book
    if (!confirm("Bu kitabı iade etmek istediğinize emin misiniz?")) return;

    try {
      await axios.post('http://localhost:3000/api/books/return', {
        userId: parseInt(userId),
        bookId: bookId
      });

      alert("✅ Kitap başarıyla iade edildi! Teşekkürler. 🌸");

      // Refresh borrowed books list after return
      fetchMyBooks(); 

    } catch (error) {
      alert("❌ Hata oluştu");
    }
  };

  return (
    // 🔥 MAIN BACKGROUND CONTAINER
    <div 
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 relative font-sans text-[#D36E70]"
        // Apply SVG background pattern
        style={bgPatternStyle}
    >
      
      {/* BACK TO BOOK LIST BUTTON */}
      <button 
        onClick={() => navigate('/books')} 
        className="absolute top-6 left-6 bg-[#fae6e6] backdrop-blur text-[#D36E70] hover:bg-[#f5d0d0] font-bold flex items-center px-4 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:border-[#D36E70] transition z-20"
      >
        ⬅ Kitap Listesi
      </button>

      <div className="max-w-4xl mx-auto mt-12 relative z-10">

        {/* HEADER SECTION */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#D36E70] mb-2 drop-shadow-sm">
                Merhaba, {userName} 👋
            </h1>

            {/* Info badge */}
            <p className="text-[#D36E70]/90 font-medium bg-[#fae6e6]/80 inline-block px-4 py-1 rounded-full border border-[#D36E70]/20">
                Şu an elinde bulunan hazineler aşağıdadır.
            </p>
        </div>

        {myBooks.length === 0 ? (
          // --- EMPTY STATE (NO BORROWED BOOKS) ---
          <div className="bg-[#fae6e6]/80 backdrop-blur p-12 rounded-3xl shadow-lg text-center border-4 border-[#D36E70]/20 border-dashed animate-fade-in-up">

            {/* Celebration icon */}
            <div className="text-6xl mb-4 animate-bounce">🎉</div>

            <p className="text-2xl font-bold text-[#D36E70]">
              Harika! Hiç borcun yok.
            </p>

            <p className="text-[#D36E70]/80 mt-2 font-medium">
              Kütüphaneden yeni maceralara atılabilirsin.
            </p>

            {/* Navigate to books page */}
            <button 
                onClick={() => navigate('/books')} 
                className="mt-6 bg-gradient-to-r from-[#D36E70] to-[#E08A8C] text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition hover:scale-105"
            >
                📚 Kitaplara Git
            </button>
          </div>
        ) : (
          // --- BORROWED BOOK LIST ---
          <div className="grid gap-6">

            {myBooks.map((item) => (
              // Individual borrowed book card
              <div 
                key={item.id} 
                className="bg-[#fae6e6]/90 backdrop-blur p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#D36E70]/20 transition duration-300 flex flex-col sm:flex-row justify-between items-center border border-[#fff0f5] hover:border-[#D36E70]/40 group"
              >
                
                <div className="flex-1">

                  {/* Reading status label */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-[#fff0f5] text-[#D36E70] text-xs font-bold px-2 py-1 rounded-full border border-[#D36E70]/20">
                        Okunuyor 📖
                    </span>
                  </div>

                  {/* Book title */}
                  <h3 className="text-2xl font-bold text-[#D36E70] group-hover:text-[#E08A8C] transition">
                    {item.book.title}
                  </h3>
                  
                  {/* Borrow and due dates */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <p className="text-[#D36E70]/80 font-medium bg-[#fff0f5] px-3 py-1 rounded-lg border border-[#D36E70]/20">
                        📅 Alınan:{' '}
                        <span className="text-[#D36E70] font-bold">
                          {new Date(item.borrowDate).toLocaleDateString()}
                        </span>
                    </p>

                    <p className="text-[#D36E70]/80 font-medium bg-[#fff0f5] px-3 py-1 rounded-lg border border-[#D36E70]/20">
                        ⏳ Son Teslim:{' '}
                        <span className="text-[#D36E70] font-bold border-b-2 border-[#D36E70]/30">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                    </p>
                  </div>
                </div>

                {/* Return button */}
                <div className="mt-4 sm:mt-0 sm:ml-6 w-full sm:w-auto">
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
