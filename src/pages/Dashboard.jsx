// AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { BookOpenCheck, Users, BarChart2, FileDown, Table, TrendingUp, Activity } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement
} from 'chart.js';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [bookCounts, setBookCounts] = useState({ SD: 0, SMP: 0, SMA: 0, Lainnya: 0 });
  const [userCount, setUserCount] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState({ labels: [], data: [] });
  const [chartType, setChartType] = useState('bar');
  const [usersData, setUsersData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(usersData.length / itemsPerPage);
  const paginatedUsers = usersData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDateTime = (timestamp) => {
    if (!timestamp?.seconds) return 'Tidak diketahui';
    return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatStringDate = (dateStr) => {
    try {
      const parts = dateStr.split(/[\/:\-,.\s]+/).map(p => parseInt(p));
      if (parts.length < 5) return 'Tidak diketahui';
      const [day, month, year, hour = 0, minute = 0, second = 0] = parts.length >= 6 ? parts : [...parts, 0];
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (isNaN(date.getTime())) return 'Tidak diketahui';
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return 'Tidak diketahui';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBookData(),
        fetchUserData(),
        fetchUserActivity(),
        fetchUsersDetails()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchBookData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'books'));
      const counts = { SD: 0, SMP: 0, SMA: 0, Lainnya: 0 };
      snapshot.forEach(doc => {
        const kategori = doc.data().kategori;
        if (kategori === 'SD') counts.SD++;
        else if (kategori === 'SMP') counts.SMP++;
        else if (kategori === 'SMA') counts.SMA++;
        else counts.Lainnya++;
      });
      setBookCounts(counts);
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUserCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUsersDetails = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          nama: userData.nama || userData.name || 'Tidak ada nama',
          jenisKelamin: userData.jenisKelamin || userData.gender || 'Tidak diketahui',
          tanggalLogin: formatStringDate(userData.loginTime || userData.tanggalDaftar),
          tanggalDaftar: userData.created_at?.seconds
            ? formatDateTime(userData.created_at)
            : formatStringDate(userData.loginTime || userData.tanggalDaftar)
        });
      });
      setUsersData(users);
    } catch (error) {
      console.error('Error fetching users details:', error);
    }
  };

  const fetchUserActivity = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'user_activity'));
      const daily = Array(7).fill(0);
      const monthly = Array(12).fill(0);
      const yearly = {};

      const now = new Date();
      snapshot.forEach(doc => {
  const raw = doc.data().loginTime;
        let date = null;

        if (raw?.toDate) {
          date = raw.toDate();
        } else if (typeof raw === 'string') {
          const parts = raw.split(/[\/:\-,.\s]+/).map(p => parseInt(p));
          if (parts.length >= 3) {
            const [day, month, year, hour = 0, minute = 0, second = 0] = parts;
            date = new Date(year, month - 1, day, hour, minute, second);
          }
        }
        if (!date || isNaN(date.getTime())) return;

        if (!date) return; // Skip kalau gak valid

        if (date.getFullYear() === now.getFullYear()) {
          monthly[date.getMonth()]++;
          const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 7) {
            daily[6 - diff]++;
          }
        }

        const year = date.getFullYear().toString();
        yearly[year] = (yearly[year] || 0) + 1;
      });

      setDailyData(daily);
      setMonthlyData(monthly);
      setYearlyData({
        labels: Object.keys(yearly),
        data: Object.values(yearly),
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

const getPast7DaysLabels = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  });
};

const exportToExcel = () => {
  try {
    // --- Sheet 1: Statistik Ringkas ---
    const statsData = [
      { Keterangan: 'Total Pembaca', Jumlah: usersData.length },
      { Keterangan: 'Buku SD', Jumlah: bookCounts.SD },
      { Keterangan: 'Buku SMP', Jumlah: bookCounts.SMP },
      { Keterangan: 'Buku SMA', Jumlah: bookCounts.SMA },
      { Keterangan: 'Buku Lainnya', Jumlah: bookCounts.Lainnya },
      { Keterangan: '', Jumlah: '' },
      { Keterangan: 'Aktivitas Harian', ...Object.fromEntries(dailyData.map((val, i) => [`Hari ke-${i + 1}`, val])) },
      { Keterangan: 'Aktivitas Bulanan', ...Object.fromEntries(monthlyData.map((val, i) => [`Bulan ke-${i + 1}`, val])) },
      { Keterangan: 'Aktivitas Tahunan', ...Object.fromEntries(yearlyData.labels.map((year, i) => [`${year}`, yearlyData.data[i]])) },
    ];

    // --- Sheet 2: Detail Pembaca ---
    const readersData = usersData.map((user, index) => ({
      No: index + 1,
      'Nama Pembaca': user.nama,
      'Jenis Kelamin': user.jenisKelamin,
      'Tanggal Login': user.tanggalLogin
    }));

    readersData.push({
      No: '',
      'Nama Pembaca': `Total Pembaca: ${usersData.length}`,
      'Jenis Kelamin': '',
      'Tanggal Login': ''
    });

    // Buat workbook dan sheet
    const wb = XLSX.utils.book_new();
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    const wsReaders = XLSX.utils.json_to_sheet(readersData);

    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik Pembaca');
    XLSX.utils.book_append_sheet(wb, wsReaders, 'Detail Pembaca');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `export_pembaca_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Gagal mengekspor data ke Excel');
  }
};

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const totalBooks = Object.values(bookCounts).reduce((a, b) => a + b, 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <BarChart2 className="w-8 h-8 text-white" />
              </div>
              Dashboard Analytics
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Listbox value={chartType} onChange={setChartType}>
              <div className="relative w-full sm:w-auto min-w-[180px]">
                <Listbox.Button className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
                  {chartType === 'bar' ? '📊 Bar Chart' : '📈 Line Chart'}
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
                </Listbox.Button>

                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full sm:min-w-[180px] overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {['bar', 'line'].map((type) => (
                    <Listbox.Option
                      key={type}
                      value={type}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {type === 'bar' ? '📊 Bar Chart' : '📈 Line Chart'}
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
            
            <button
              onClick={() => setShowTable(!showTable)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Table className="w-4 h-4" />
              {showTable ? 'Sembunyikan' : 'Tampilkan'} Tabel
            </button>
            
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FileDown className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Buku"
            value={totalBooks}
            icon={<BookOpenCheck className="w-8 h-8" />}
            gradient="from-purple-500 to-indigo-600"
          />
          <StatCard
            title="Buku SD"
            value={bookCounts.SD}
            icon={<BookOpenCheck className="w-8 h-8" />}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatCard
            title="Buku SMP"
            value={bookCounts.SMP}
            icon={<BookOpenCheck className="w-8 h-8" />}
            gradient="from-green-500 to-teal-600"
          />
          <StatCard
            title="Buku SMA"
            value={bookCounts.SMA}
            icon={<BookOpenCheck className="w-8 h-8" />}
            gradient="from-yellow-500 to-orange-600"
          />
          <StatCard
            title="Buku Lainnya"
            value={bookCounts.Lainnya}
            icon={<BookOpenCheck className="w-8 h-8" />}
            gradient="from-pink-500 to-rose-600"
          />
          <StatCard
            title="Total Pembaca"
            value={userCount}
            icon={<Users className="w-8 h-8" />}
            gradient="from-red-500 to-pink-600"
          />
        </div>

        {/* Table Section */}
        {showTable && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Data Pembaca ({usersData.length} orang terdaftar)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['No', 'Nama Pembaca', 'Jenis Kelamin', 'Tanggal Login'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.nama}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.jenisKelamin === 'Laki-laki'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
                      }`}>
                        {user.jenisKelamin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.tanggalDaftar}</td>
                  </tr>
                ))}
              </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-center items-center py-4 gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === index + 1
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              {usersData.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada data pembaca</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <ChartCard
              type={chartType}
              title="Aktivitas Bulanan"
              labels={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]}
              data={monthlyData}
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
          <div>
            <DoughnutCard
              title="Distribusi Buku"
              data={Object.values(bookCounts)}
              labels={Object.keys(bookCounts)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          type={chartType}
          title="Aktivitas 7 Hari Terakhir"
          labels={getPast7DaysLabels()}
          data={dailyData}
          icon={<Activity className="w-6 h-6" />}
        />
        <ChartCard
          type={chartType}
          title="Aktivitas Tahunan"
          labels={yearlyData.labels}
          data={yearlyData.data}
          icon={<BarChart2 className="w-6 h-6" />}
        />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, gradient, change }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        </div>
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, labels, data, type, icon }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: type === 'line' 
          ? 'rgba(99, 102, 241, 0.1)'
          : 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        fill: type === 'line' ? true : false,
        tension: 0.4,
        borderRadius: type === 'bar' ? 8 : 0,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => `${context.parsed.y} pembaca`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          precision: 0,
          color: 'rgba(107, 114, 128, 0.8)',
          font: { size: 12 }
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.3)',
          borderDash: [5, 5]
        },
        border: { display: false }
      },
      x: {
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          font: { size: 12 }
        },
        grid: {
          display: false
        },
        border: { display: false }
      }
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-indigo-600">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div style={{ height: '300px' }}>
          <ChartComponent data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}

function DoughnutCard({ title, data, labels }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12 },
          color: 'rgba(107, 114, 128, 1)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 12,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} buku`,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpenCheck className="w-6 h-6 text-indigo-600" />
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div style={{ height: '300px' }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}