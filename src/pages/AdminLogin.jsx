import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import logo1 from '../assets/kkn.png';
import logo2 from '../assets/Sinjai.png';
import { ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Email dan password harus diisi!',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login gagal. Periksa email dan password Anda.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white dark:bg-gray-900 px-4">
      <div className="bg-gradient-to-br from-[#E64946] to-red-600 rounded-xl shadow-2xl px-6 sm:px-8 py-10 w-full max-w-md text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center gap-4">
          <img src={logo1} alt="Logo 1" className="w-16 h-16 object-contain" />
          <img src={logo2} alt="Logo 2" className="w-16 h-16 object-contain" />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          Perpustakaan Digital Desa Palae
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="text-white text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="mt-1 w-full px-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E64946] text-sm shadow-md"
            />
          </div>

          <div>
            <label className="text-white text-sm font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="mt-1 w-full px-4 py-3 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E64946] text-sm shadow-md"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black 
                flex items-center justify-center 
                hover:scale-110 hover:shadow-xl transition-all duration-300 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-[#E64946] focus:ring-offset-2 
                border border-gray-300"
            >
              <ArrowRight className="text-black" size={26} strokeWidth={2} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-white text-center bg-red-700 bg-opacity-40 px-4 py-2 rounded-full mt-2">
              {error}
            </p>
          )}
        </form>

        {/* Link */}
        <p className="text-white text-sm mt-2">
          Kembali ke halaman utama?{' '}
          <a href="/" className="underline hover:no-underline font-medium">
            Klik Disini
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
