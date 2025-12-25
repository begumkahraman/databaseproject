// React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Axios library for making HTTP requests
import axios from 'axios';

// Hook used for navigation between routes
import { useNavigate } from 'react-router-dom';

// Inline SVG background pattern styling
const bgPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-8 10c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm-16 8c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm8 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM8 24c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM4 36c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zM0 50c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm16 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0zm24 0c-2 2-2 6 0 8 2 2 6 2 8 0 2-2 2-6 0-8-2-2-6-2-8 0z' fill='%23D36E70' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

// Admin page component for listing and managing books
export default function AdminBookList() {

  // State variable that stores the list of books
  const [books, setBooks] = useState([]);

  // Navigation function to move between routes
  const navigate = useNavigate();

  // Runs once when the component is mounted
  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetches all books from the backend API
  const fetchBooks = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/books');
        setBooks(response.data);
    } catch (error) {
        console.error("Hata:", error);
    }
  };

  // Deletes a selected book by its ID
  const handleDeleteBook = async (bookId) => {

    // Confirmation dialog before deleting
    if (!window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/books/${bookId}`);
      alert("🗑️ Kitap silindi.");

      // Refresh book list after deletion
      fetchBooks(); 
    } catch (error) {
      alert("Silme hatası.");
    }
  };

  return (
    <div 
        // Main page container with gradient background and pattern
        className="min-h-screen bg-gradient-to-br from-[#FDE2E2] via-[#FFF0F5] to-[#FDE2E2] p-6 md:p-10 font-sans text-[#D36E70]"
        style={bgPatternStyle}
    >
      <div className="max-w-6xl mx-auto bg-[#fae6e6]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#fff0f5]">
        
        {/* Page header section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#D36E70] flex items-center gap-2">
            📚 Kitap Yönetimi
          </h2>

          {/* Button to navigate back to admin panel */}
          <button 
             onClick={() => navigate('/admin')}
             className="bg-[#FFF0F5] text-[#D36E70] font-bold px-6 py-2 rounded-full shadow-sm border border-[#D36E70]/30 hover:bg-white transition"
          >
             ⬅ Admin Paneline Dön
          </button>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto rounded-2xl border border-[#D36E70]/10">
          <table className="w-full text-left">

            {/* Table header row */}
            <thead className="bg-[#FFF0F5] text-[#D36E70] uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b border-[#D36E70]/20">ID</th>
                <th className="p-4 border-b border-[#D36E70]/20">Kitap Adı</th>
                <th className="p-4 border-b border-[#D36E70]/20">Yazar</th>
                <th className="p-4 border-b border-[#D36E70]/20">ISBN</th>
                <th className="p-4 border-b border-[#D36E70]/20">Stok</th>
                <th className="p-4 border-b border-[#D36E70]/20">İşlem</th>
              </tr>
            </thead>

            {/* Table body containing book rows */}
            <tbody className="text-sm bg-[#fae6e6]/50">
              {books.map(book => (
                <tr key={book.id} className="border-b border-[#D36E70]/10 hover:bg-[#FFF0F5] transition">
                  <td className="p-4 font-bold text-[#D36E70]/50">#{book.id}</td>
                  <td className="p-4 font-bold text-[#D36E70]">{book.title}</td>
                  <td className="p-4 text-[#D36E70]/80">{book.author}</td>
                  <td className="p-4 font-mono text-xs">{book.isbn}</td>
                  <td className="p-4 font-bold">{book.inventory?.available}</td>

                  {/* Action column */}
                  <td className="p-4">
                    <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-red-200 transition transform active:scale-95"
                    >
                        SİL 🗑️
                    </button>
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
