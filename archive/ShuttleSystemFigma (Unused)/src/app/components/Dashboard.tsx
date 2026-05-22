import { useState } from 'react';
import {
  Bus,
  Calendar,
  MapPin,
  History as HistoryIcon,
  User,
  Map,
  Settings,
  Bell,
  ShoppingCart,
  Clock,
  Users,
  Navigation,
  ChevronRight
} from 'lucide-react';
import logo from '../../imports/Pastel_Circle_Logo_ambatu-removebg-preview.png';
import MyTickets from './MyTickets';
import History from './History';
import Profile from './Profile';
import ScheduleList from './ScheduleList';
import SeatSelection from './SeatSelection';
import LiveTracking from './LiveTracking';
import RouteSelection from './RouteSelection';
import AvailabilityCheck from './AvailabilityCheck';
import AdminPanel from './AdminPanel';
import DriverPanel from './DriverPanel';
import MoreMenu from './MoreMenu';
import BookingFlow from './BookingFlow';

interface DashboardProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [activePage, setActivePage] = useState<string | null>(null);

  // Handle page navigation
  if (activePage === 'tickets') {
    return <MyTickets onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'history') {
    return <History onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'profile') {
    return <Profile user={user} onBack={() => setActivePage(null)} onLogout={onLogout} />;
  }
  if (activePage === 'schedule') {
    return <ScheduleList onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'seats') {
    return <BookingFlow onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'tracking') {
    return <LiveTracking onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'route') {
    return <RouteSelection onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'availability') {
    return <AvailabilityCheck onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'admin') {
    return <AdminPanel onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'driver') {
    return <DriverPanel onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'more') {
    return <MoreMenu
      onBack={() => setActivePage(null)}
      onNavigate={setActivePage}
      onLogout={onLogout}
    />;
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 pt-8 pb-24 rounded-b-3xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm">Selamat Datang</p>
              <h2 className="text-white text-xl font-semibold">{user.name}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <Bell size={20} className="text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <User size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Ambatu Bus" className="w-8 h-8" />
                <span className="font-semibold text-gray-800">Ambatu Points</span>
              </div>
              <span className="text-2xl font-bold text-[#7fb52a]">250</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActivePage('schedule')}
                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar size={24} className="text-[#7fb52a] mb-1" />
                <span className="text-xs text-gray-600">Jadwal</span>
              </button>
              <button
                onClick={() => setActivePage('seats')}
                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart size={24} className="text-[#7fb52a] mb-1" />
                <span className="text-xs text-gray-600">Booking</span>
              </button>
              <button
                onClick={() => setActivePage('history')}
                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HistoryIcon size={24} className="text-[#7fb52a] mb-1" />
                <span className="text-xs text-gray-600">Riwayat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 -mt-16 px-6 pb-24 overflow-y-auto">
        {/* Active Trip Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-amber-800">Perjalanan Aktif</span>
          </div>
          <p className="text-xs text-amber-600">Tidak ada perjalanan yang sedang berlangsung</p>
        </div>

        {/* Service Categories */}
        <div className="mb-6">
          <h3 className="text-gray-800 font-semibold mb-4">Layanan Shuttle</h3>
          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => setActivePage('schedule')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Calendar size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Jadwal Shuttle</span>
            </button>

            <button onClick={() => setActivePage('availability')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Users size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Ketersediaan Kursi</span>
            </button>

            <button onClick={() => setActivePage('seats')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <ShoppingCart size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Booking Kursi</span>
            </button>

            <button onClick={() => setActivePage('tracking')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Navigation size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Tracking Real-Time</span>
            </button>

            <button onClick={() => setActivePage('route')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Map size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Pemilihan Rute</span>
            </button>

            <button onClick={() => setActivePage('history')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <HistoryIcon size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">History</span>
            </button>

            <button onClick={() => setActivePage('tracking')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Clock size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Monitor Perjalanan</span>
            </button>

            <button onClick={() => setActivePage('more')} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-2 shadow-lg hover:scale-105 transition-transform">
                <Settings size={28} className="text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Lainnya</span>
            </button>
          </div>
        </div>

        {/* Promo Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Promo Terbaru</h3>
            <button className="text-[#7fb52a] text-sm font-medium flex items-center gap-1">
              Lihat Semua
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="min-w-[280px] bg-gradient-to-br from-[#9dc847] to-[#7fb52a] rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-2">20%</div>
              <p className="text-sm mb-2">Diskon Spesial</p>
              <p className="text-xs opacity-90">Untuk pengguna baru Ambatu Bus</p>
              <p className="text-xs mt-4 opacity-75">*Syarat & ketentuan berlaku</p>
            </div>

            <div className="min-w-[280px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-2">3x</div>
              <p className="text-sm mb-2">Poin Berlipat</p>
              <p className="text-xs opacity-90">Setiap pembelian tiket di weekend</p>
              <p className="text-xs mt-4 opacity-75">*Syarat & ketentuan berlaku</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-6">
          <h3 className="text-gray-800 font-semibold mb-4">Booking Terakhir</h3>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#9dc847]/10 flex items-center justify-center">
                  <Bus size={24} className="text-[#7fb52a]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Jakarta - Bandung</p>
                  <p className="text-sm text-gray-500">15 Mei 2026 • 08:00 WIB</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Completed
                  </span>
                </div>
              </div>
              <button className="text-[#7fb52a] text-sm font-medium">Detail</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveTab('beranda');
              setActivePage(null);
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'beranda' ? 'text-[#7fb52a]' : 'text-gray-400'
            }`}
          >
            <Bus size={24} />
            <span className="text-xs">Beranda</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tiket');
              setActivePage('tickets');
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'tiket' ? 'text-[#7fb52a]' : 'text-gray-400'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs">Tiket Saya</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('riwayat');
              setActivePage('history');
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'riwayat' ? 'text-[#7fb52a]' : 'text-gray-400'
            }`}
          >
            <HistoryIcon size={24} />
            <span className="text-xs">Riwayat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('akun');
              setActivePage('profile');
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'akun' ? 'text-[#7fb52a]' : 'text-gray-400'
            }`}
          >
            <User size={24} />
            <span className="text-xs">Akun</span>
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
