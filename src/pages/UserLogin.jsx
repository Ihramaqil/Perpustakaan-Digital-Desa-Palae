import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import logo1 from '../assets/kkn.png';
import logo2 from '../assets/Sinjai.png';
import { ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const UserLogin = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !gender) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Harap lengkapi semua data!',
      });
      return;
    }

    const loginTime = new Date().toLocaleString();
    const userData = { name, gender, loginTime };

    try {
      await addDoc(collection(db, 'users'), userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/home');
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi!');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white dark:bg-gray-900 px-4 sm:px-0">
      <div className="bg-gradient-to-br from-[#E64946] to-red-600 rounded-xl shadow-2xl px-6 sm:px-8 py-10 w-full max-w-md text-center space-y-6">
        <div className="flex justify-center space-x-4 mb-6">
          <img src={logo1} alt="Logo 1" className="w-16 sm:w-20 h-auto object-contain" />
          <img src={logo2} alt="Logo 2" className="w-16 sm:w-20 h-auto object-contain" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
          Perpustakaan Digital Desa Palae
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="text-white text-sm font-semibold mb-2 block">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-full border-none bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E64946] text-sm shadow-md"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div className="text-left">
            <label className="text-white text-sm font-semibold mb-3 block">Jenis Kelamin</label>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {['Perempuan', 'Laki-Laki'].map((g) => (
                <label key={g} className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      value={g}
                      checked={gender === g}
                      onChange={(e) => setGender(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${gender === g ? 'bg-white' : 'bg-transparent'}`}>
                      {gender === g && <div className="w-2.5 h-2.5 rounded-full bg-[#E64946]"></div>}
                    </div>
                  </div>
                  <span className="ml-2 text-white font-medium text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E64946] focus:ring-offset-2 border border-gray-300"
            >
              <ArrowRight className="text-black" size={24} strokeWidth={2} />
            </button>
          </div>

          {error && (
            <div className="text-center">
              <p className="text-white text-sm bg-red-700 bg-opacity-50 py-2 px-4 rounded-full">
                {error}
              </p>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-white text-xs">
              Admin?{' '}
              <a
                href="/admin"
                className="underline hover:no-underline font-medium transition-colors duration-200"
              >
                Klik Disini
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
