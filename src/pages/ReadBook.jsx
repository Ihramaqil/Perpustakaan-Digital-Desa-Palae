import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import {
  ArrowLeft,
  BookOpenCheck,
  PlusCircle,
  Download,
  List,
  Bookmark,
} from 'lucide-react';
import Spinner from '../components/Spinner';

const ReadBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const pageNavPlugin = pageNavigationPlugin();
  const { jumpToPage } = pageNavPlugin;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const ref = doc(db, 'books', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBook(snap.data());
        } else {
          setFetchError(true);
        }
      } catch (error) {
        console.error('Gagal mengambil data buku:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks-${id}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, [id]);

  const handlePdfLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfError(true);
  };

  const handlePageChange = (e) => {
    const page = e.currentPage;
    setCurrentPage(page);
    localStorage.setItem(
      `readProgress-${id}`,
      JSON.stringify({ page, updatedAt: new Date().toISOString() })
    );
    if (numPages > 0) {
      const percent = Math.floor(((page + 1) / numPages) * 100);
      setProgressPercent(percent);
    }
  };

  const handleAddBookmark = () => {
    if (!bookmarks.includes(currentPage)) {
      const updated = [...bookmarks, currentPage].sort((a, b) => a - b);
      setBookmarks(updated);
      localStorage.setItem(`bookmarks-${id}`, JSON.stringify(updated));
    }
  };

  const handleJumpToBookmark = (page) => {
    jumpToPage(page);
    setShowDropdown(false);
  };

  const handleDownload = () => {
    if (!book?.pdfUrl) return;
    const link = document.createElement('a');
    link.href = book.pdfUrl;
    link.download = `${book.title || 'buku'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-6 sm:px-6 relative">
      {/* Header Buttons */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#E64946] to-red-600 hover:from-red-600 hover:to-[#E64946] rounded-full shadow transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <button
            onClick={handleAddBookmark}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Simpan Halaman ({currentPage + 1})
          </button>
        </div>

        {/* Custom Bookmark Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-md focus:outline-none"
          >
            <List className="w-4 h-4" />
            Bookmark
          </button>

          {showDropdown && bookmarks.length > 0 && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              {bookmarks.map((page) => (
                <button
                  key={page}
                  onClick={() => handleJumpToBookmark(page)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-green-100 dark:hover:bg-gray-700"
                >
                  Halaman {page + 1}
                </button>
              ))}
            </div>
          )}

          {showDropdown && bookmarks.length === 0 && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex gap-1 items-center">
                <Bookmark className="w-4 h-4" /> Belum ada bookmark
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Judul Buku */}
      <div className="text-center mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
        <BookOpenCheck className="w-6 h-6 text-[#E64946]" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E64946]">
          {loading ? 'Memuat buku...' : book?.title || 'Buku tidak ditemukan'}
        </h1>
      </div>

      {/* Progress */}
      {!loading && numPages > 0 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-300 mb-4">
          Progres Bacaan:{' '}
          <span className="font-semibold text-[#E64946]">{progressPercent}%</span>
        </p>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {/* Error States */}
      {!loading && fetchError && (
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">Buku tidak ditemukan atau gagal dimuat.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#E64946] text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}

      {!loading && book && !book.pdfUrl && (
        <div className="text-center mt-8">
          <p className="text-yellow-600 mb-4">PDF tidak tersedia untuk buku ini.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#E64946] text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}

      {!loading && book && pdfError && (
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">Gagal memuat PDF. Coba lagi nanti.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mr-2 bg-[#E64946] text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}

      {/* PDF Viewer */}
      {!loading && book?.pdfUrl && !fetchError && !pdfError && (
        <div className="w-full max-w-[900px] mx-auto h-[85vh] border rounded-xl shadow overflow-hidden bg-white dark:bg-black">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={book.pdfUrl}
              plugins={[pageNavPlugin]}
              onDocumentLoad={(e) => {
                const totalPages = e.doc.numPages;
                setNumPages(totalPages);
                const saved = JSON.parse(localStorage.getItem(`readProgress-${id}`));
                if (saved?.page) jumpToPage(saved.page);
                setProgressPercent(
                  saved?.page ? Math.floor(((saved.page + 1) / totalPages) * 100) : 0
                );
              }}
              onPageChange={handlePageChange}
              defaultScale={SpecialZoomLevel.PageFit}
              renderLoader={() => <Spinner />}
            />
          </Worker>
        </div>
      )}

      {/* Floating Download Button */}
      {book?.pdfUrl && (
        <button
          onClick={handleDownload}
          title="Download PDF"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#E64946] text-white shadow-lg hover:scale-110 hover:bg-red-600 transition-all flex items-center justify-center z-50"
        >
          <Download className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ReadBook;
