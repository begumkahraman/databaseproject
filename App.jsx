import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import AdminPanel from './pages/AdminPanel';
import MyBooks from './pages/MyBooks';
import TransactionList from './pages/TransactionList';

// Admin pages
import UserList from './pages/UserList';
import AdminBookList from './pages/AdminBookList';

function App() {
  return (
    // Main router wrapper
    <BrowserRouter>
      <Routes>

        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Book pages */}
        <Route path="/books" element={<BookList />} />
        <Route path="/my-books" element={<MyBooks />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Admin pages */}
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/books" element={<AdminBookList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
