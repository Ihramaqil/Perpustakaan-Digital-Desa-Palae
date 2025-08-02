import React, { useState } from 'react';
import { db, storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';
import { UploadCloud, XCircle, Eye, Check, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { Listbox } from '@headlessui/react';

const AdminUpload = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const categories = ['', 'SD', 'SMP', 'SMA', 'Lainnya'];

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !author || !category || !file || !coverImage) {
      Swal.fire({
  icon: 'warning',
  title: 'Data Belum Lengkap',
  text: 'Harap isi semua data terlebih dahulu.',
  confirmButtonText: 'Oke',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
      return;
    }

    if (file.size > 50 * 1024 * 1024 || coverImage.size > 30 * 1024 * 1024) {
      Swal.fire({
  icon: 'warning',
  title: 'Ukuran File Terlalu Besar',
  text: 'PDF max 10MB dan Cover max 5MB.',
  confirmButtonText: 'Mengerti',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
      return;
    }

    setUploading(true);

    try {
      const safeName = file.name.replace('.pdf', '').replace(/[^a-zA-Z0-9-_]/g, '_');
      const coverExt = coverImage.name.split('.').pop();

      const pdfRef = ref(storage, `books/${safeName}.pdf`);
      const coverRef = ref(storage, `covers/${safeName}.${coverExt}`);

      await uploadBytes(coverRef, coverImage);
      const coverUrl = await getDownloadURL(coverRef);

      const uploadTask = uploadBytesResumable(pdfRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        },
        (error) => {
          throw error;
        },
        async () => {
          const pdfUrl = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, 'books'), {
            title,
            author,
            kategori: category,
            pdfUrl,
            coverUrl,
            uploadedAt: new Date()
          });

          setTitle('');
          setAuthor('');
          setCategory('');
          setFile(null);
          setCoverImage(null);
          setProgress(0);
          setUploading(false);

          Swal.fire({
  icon: 'success',
  title: 'Berhasil',
  text: 'Buku berhasil diupload!',
  confirmButtonText: 'Mantap!',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
        }
      );
    } catch (error) {
      console.error('🔥 Upload error:', error);
      setUploading(false);
      Swal.fire({
  icon: 'error',
  title: 'Gagal',
  text: 'Gagal upload file atau cover.',
  confirmButtonText: 'Coba Lagi',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});

    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e, isCover = false) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (isCover) {
      if (droppedFile?.type.startsWith('image/')) {
        setCoverImage(droppedFile);
      } else {
        Swal.fire({
  icon: 'warning',
  title: 'Format Tidak Didukung',
  text: 'Hanya gambar (PNG/JPG) yang diperbolehkan untuk cover.',
  confirmButtonText: 'Oke',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
      }
    } else {
      if (droppedFile?.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        Swal.fire({
  icon: 'warning',
  title: 'Format Tidak Didukung',
  text: 'Hanya file PDF yang diperbolehkan.',
  confirmButtonText: 'Oke',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <UploadCloud className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Buku Baru</h2>
          </div>

          <input
            type="text"
            placeholder="Judul Buku"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            placeholder="Nama Penulis"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="p-3 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />

          {/* Kategori */}
          <div className="w-full">
            <Listbox value={category} onChange={setCategory}>
              <div className="relative">
                <Listbox.Button className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 flex justify-between items-center">
                  {category ? (category === 'Lainnya' ? 'Buku Lainnya' : category) : 'Pilih Kategori'}
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-gray-900 dark:text-white">
                  {categories.map((item) => (
                    <Listbox.Option key={item} value={item} className="cursor-pointer select-none relative py-2 pl-10 pr-4">
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item || 'Pilih Kategori'}</span>
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

          {/* PDF Upload */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, false)}
            className={`border-2 border-dashed p-4 rounded-lg transition-all cursor-pointer ${
              dragOver ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {!file ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop file PDF di sini</p>
                <label htmlFor="fileInput" className="block mt-2 text-orange-500 cursor-pointer hover:underline">
                  Pilih File PDF
                </label>
              </div>
            ) : (
              <div className="flex justify-between items-center text-white bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-md">
                <span className="truncate max-w-[200px]">📄 {file.name}</span>
                <button type="button" onClick={() => setFile(null)}>
                  <XCircle className="w-5 h-5 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="fileInput"
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-lg h-4 overflow-hidden">
              <div className="bg-orange-500 h-4 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition duration-300 shadow-md disabled:opacity-50"
          >
            {uploading ? `Uploading... ${progress}%` : 'Upload Buku'}
          </button>
        </form>

        {/* Preview Cover */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, true)}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed p-6 rounded-2xl transition-all ${
            dragOver ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Eye className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Preview Cover</h2>
          </div>

          {coverImage ? (
            <div className="relative w-full text-center">
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Preview"
                className="max-h-[350px] mx-auto object-contain rounded-lg shadow"
              />
              <button
                type="button"
                onClick={() => setCoverImage(null)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-gray-500 dark:text-gray-400">Preview cover akan muncul di sini</p>
              <p className="text-sm text-gray-400">Drag & drop atau klik untuk unggah cover</p>
              <label htmlFor="coverInput" className="block mt-2 text-orange-500 cursor-pointer hover:underline">
                Pilih Gambar Cover (PNG/JPG)
              </label>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files[0];
              if (selected?.type.startsWith('image/')) {
                setCoverImage(selected);
              } else {
                Swal.fire({
  icon: 'warning',
  title: 'Format Tidak Didukung',
  text: 'Hanya gambar (PNG/JPG) yang diperbolehkan untuk cover.',
  confirmButtonText: 'Oke',
  confirmButtonColor: '#E64946',
  background: '#1f2937',
  color: '#f3f4f6',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'bg-[#E64946] hover:bg-[#d43735] text-white px-4 py-2 rounded-md',
    title: 'text-lg font-semibold',
    content: 'text-sm',
  },
});
              }
            }}
            className="hidden"
            id="coverInput"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUpload;
