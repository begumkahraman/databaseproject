import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Sayfaları İçeri Aktar
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import AdminPanel from './pages/AdminPanel';
import MyBooks from './pages/MyBooks'; 
import TransactionList from './pages/TransactionList'; 

// 🆕 YENİ EKLENEN SAYFALAR (Dosyaları oluşturduktan sonra buraya ekliyoruz)
import UserList from './pages/UserList';
import AdminBookList from './pages/AdminBookList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana Sayfa */}
        <Route path="/" element={<Home />} />
        
        {/* Kimlik Doğrulama */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Kitap İşlemleri */}
        <Route path="/books" element={<BookList />} />
        <Route path="/my-books" element={<MyBooks />} />
        
        {/* Yönetim Paneli (Ana Dashboard) */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* --- 🆕 YENİ YÖNETİM SAYFALARI --- */}
        
        {/* 1. İşlem Geçmişi */}
        <Route path="/transactions" element={<TransactionList />} />

        {/* 2. Üye Listesi */}
        <Route path="/admin/users" element={<UserList />} />

        {/* 3. Kitap Yönetimi (Silme/Düzenleme) */}
        <Route path="/admin/books" element={<AdminBookList />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;