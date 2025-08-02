import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs  }from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Home = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, 'books'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-orange-600">📚 Perpustakaan Digital Desa Palae</h1>
      <p className="text-center text-gray-700 mb-8">Baca buku online untuk anak SD, SMP, dan SMA</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {books.map(book => (
          <Link key={book.id} to={`/book/${book.id}`} className="bg-white shadow-lg rounded p-4 hover:scale-105 transition">
            <h2 className="font-semibold text-lg text-orange-700">{book.title}</h2>
            <p className="text-sm text-gray-500">{book.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;