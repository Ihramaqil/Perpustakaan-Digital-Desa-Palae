import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';
import { Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

const BookCollection = () => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const kategoriList = ['Semua', 'SD', 'SMP', 'SMA', 'Lainnya'];
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedBook, setEditedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const snapshot = await getDocs(collection(db, 'books'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBooks(data);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Buku?',
      text: 'Data buku yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E64946',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'books', id));
        fetchBooks();
        Swal.fire('Terhapus!', 'Buku telah dihapus.', 'success');
      }
    });
  };

  const handleEdit = (book) => {
    setEditedBook(book);
    setEditModalOpen(true);
  };

  const filteredBooks = filter === 'Semua' ? books : books.filter(b => b.kategori === filter);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Koleksi Buku</h2>
          <Listbox value={filter} onChange={setFilter}>
            <div className="relative w-48">
              <Listbox.Button className="w-full p-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center">
                {filter}
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </Listbox.Button>

              <Listbox.Options className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto text-sm text-gray-900 dark:text-white">
                {kategoriList.map((item) => (
                  <Listbox.Option
                    key={item}
                    value={item}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {item}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Check className="w-4 h-4 text-white" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Tidak ada buku dalam kategori ini.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-4 shadow-sm">
                {book.coverUrl && (
                  <img src={book.coverUrl} alt="Cover Buku" className="w-full h-48 object-cover rounded-lg mb-3" />
                )}
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{book.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Penulis: {book.author}</p>
                <p className="text-xs text-orange-600 font-semibold mt-1">Kategori: {book.kategori}</p>

                <div className="flex gap-3 mt-4">
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg"
                  >
                    Baca Buku
                  </a>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Edit Buku */}
        {editModalOpen && editedBook && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md shadow-lg space-y-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Buku</h2>
              
              <input
                type="text"
                value={editedBook.title}
                onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                placeholder="Judul Buku"
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              />

              <input
                type="text"
                value={editedBook.author}
                onChange={(e) => setEditedBook({ ...editedBook, author: e.target.value })}
                placeholder="Penulis"
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              />

              <Listbox
                value={editedBook.kategori}
                onChange={(val) => setEditedBook({ ...editedBook, kategori: val })}
              >
                <div className="relative w-full">
                  <Listbox.Button className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded flex justify-between items-center">
                    {editedBook.kategori}
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </Listbox.Button>

                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-auto">
                    {['SD', 'SMP', 'SMA', 'Lainnya'].map((item) => (
                      <Listbox.Option
                        key={item}
                        value={item}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-indigo-600 text-white' : 'text-gray-800 dark:text-white'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {item}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Check className="w-4 h-4 text-white" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const { id, title, author, kategori } = editedBook;
                    if (!title || !author || !kategori) {
                      Swal.fire('Gagal', 'Semua field harus diisi!', 'error');
                      return;
                    }
                    await updateDoc(doc(db, 'books', id), { title, author, kategori });
                    setEditModalOpen(false);
                    setEditedBook(null);
                    fetchBooks();
                    Swal.fire('Berhasil', 'Data buku berhasil diperbarui.', 'success');
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookCollection;
