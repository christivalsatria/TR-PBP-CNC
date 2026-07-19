import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      alert('Username dan Password wajib diisi!');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Ambil token dan user objek dari segala kemungkinan bentuk response Axios
      const token = response?.data?.token || response?.token;
      const userObj = response?.data?.user || response?.user;
      const roleMentah = userObj?.role || response?.data?.role || response?.role;

      if (token) {
        localStorage.setItem('token', token);
        const role = roleMentah ? String(roleMentah).trim() : '';
        localStorage.setItem('role', role);

        console.log(`Login sukses! Role yang terdeteksi: "${role}"`);

        // 🟢 LANGKAH KRUSIAL: Matikan loading terlebih dahulu agar elemen form tidak terkunci saat redirect
        setLoading(false);

        // Pengalihan rute berdasarkan role murni
        if (role.toLowerCase() === 'admin') {
          console.log('Mengarahkan ke Dashboard Admin...');
          navigate('/admin');
        } else {
          console.log('Mengarahkan ke Menu Kasir...');
          navigate('/menu');
        }
        
        return; // Hentikan fungsi di sini agar tidak masuk ke blok finally
      } else {
        setError('Login berhasil, namun token gagal dikirim oleh server.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Gagal tersambung ke server. Periksa koneksi atau data akun Anda.';
      setError(msg);
    } finally {
      // Hanya akan berjalan jika proses try di atas gagal/melempar error
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c58d59]">
      <div className="w-full max-w-[460px] bg-[#FAF6F0] rounded-2xl p-10 flex flex-col items-center shadow-md mx-4">
        
        {/* LOGO CNC */}
        <div className="w-32 h-32 rounded-full bg-[#713f27] flex items-center justify-center mb-8 select-none">
          <span className="text-6xl font-semibold text-[#c58d59] tracking-wide font-['Afacad']">
            CNC
          </span>
        </div>

        {/* NOTIFIKASI ERROR */}
        {error && (
          <div className="w-full bg-red-100 border border-red-300 text-red-700 p-2.5 rounded-lg text-sm text-center font-medium mb-4">
            {error}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-[#713f27] text-lg font-bold mb-1">
              Enter username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={loading}
              className="w-full bg-[#D9D9D9] text-gray-700 placeholder-gray-500 px-4 py-2.5 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#713f27] transition-all"
            />
          </div>
          <div>
            <label className="block text-[#713f27] text-lg font-bold mb-1">
              Enter password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="w-full bg-[#D9D9D9] text-gray-700 placeholder-gray-500 px-4 py-2.5 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#713f27] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#713f27] hover:bg-[#5c321e] text-white text-lg font-medium py-2.5 rounded-lg mt-4 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default LoginPage;