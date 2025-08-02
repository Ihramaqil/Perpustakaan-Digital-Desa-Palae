import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminUpload from './pages/AdminUpload';
import Books from './pages/Books';
import ReadBook from './pages/ReadBook';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<AdminUpload />} />
        <Route path="/books" element={<Books />} />
        <Route path="/book/:id" element={<ReadBook />} />
      </Routes>
    </Router>
  );
}

export default App;
