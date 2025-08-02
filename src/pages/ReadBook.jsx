// File: src/pages/ReadBook.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const ReadBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const ref = doc(db, 'books', id);
      const snap = await getDoc(ref);
      if (snap.exists()) setBook(snap.data());
    };
    fetchBook();
  }, [id]);

  return (
    <div className="p-4 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center text-orange-600">📖 {book?.title}</h1>
      {book?.pdfUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <div className="h-screen border">
            <Viewer fileUrl={book.pdfUrl} />
          </div>
        </Worker>
      )}
    </div>
  );
};

export default ReadBook;
