import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const categories = ['Semua', 'SD', 'SMP', 'SMA', 'Lainnya'];

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, 'books'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
      setFilteredBooks(data);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = books.filter(book => {
      const matchCategory = selectedCategory === 'Semua' || book.kategori === selectedCategory;
      const matchSearch = book.title.toLowerCase().includes(lowerSearch);
      return matchCategory && matchSearch;
    });
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, books]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 py-10 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="text-center mb-8 px-2">
        <h1 className="text-2xl sm:text-4xl font-bold text-[#E64946] mb-2 leading-tight">
          📚 Perpustakaan Digital Desa Palae
        </h1>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Baca buku online untuk semua kategori
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 px-2">
        <div className="flex items-center w-full sm:max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 shadow-sm">
          <Search className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari judul buku..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#E64946]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Lainnya' ? 'Kategori Lainnya' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {currentBooks.map(book => {
          const saved = JSON.parse(localStorage.getItem(`readProgress-${book.id}`));
          const totalPages = saved?.totalPages ?? 0;
          const currentPage = saved?.page ?? 0;
          const progress = totalPages > 0 ? Math.floor(((currentPage + 1) / totalPages) * 100) : 0;

          return (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="bg-gradient-to-br from-orange-100 to-red-200 dark:from-[#2b2b2b] dark:to-[#3b3b3b] rounded-xl p-4 shadow-md hover:scale-105 transition-all duration-300"
            >
              {book.coverUrl && (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-44 sm:h-48 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="font-semibold text-base sm:text-lg text-[#E64946] dark:text-[#E64946] truncate">
                {book.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{book.author}</p>
              <span className="inline-block mt-2 text-xs bg-[#E64946] text-white px-2 py-1 rounded-full">
                {book.kategori}
              </span>

              {progress > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#E64946] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                    {progress}% dibaca
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredBooks.length > booksPerPage && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-[#E64946] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              } hover:bg-[#E64946] hover:text-white transition`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center mt-12 px-2">
          <p className="text-gray-500 dark:text-gray-400">Buku tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
