import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Bell, CreditCard, LogOut, ChevronRight, Star } from 'lucide-react';

interface ProfileProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  onBack: () => void;
  onLogout: () => void;
}

export default function Profile({ user, onBack, onLogout }: ProfileProps) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 pt-6 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Profil Saya</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9dc847] to-[#7fb52a] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600">Member Gold</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[#7fb52a]">250</p>
              <p className="text-xs text-gray-600 mt-1">Points</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[#7fb52a]">12</p>
              <p className="text-xs text-gray-600 mt-1">Perjalanan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-8 px-6 overflow-y-auto pb-24">
        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Informasi Akun</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <Mail size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{user.email}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <Phone size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-500">Nomor Telepon</p>
                <p className="text-gray-800">{user.phone}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <MapPin size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-500">Alamat</p>
                <p className="text-gray-800">Jakarta, Indonesia</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Pengaturan</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-gray-800">Notifikasi</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <CreditCard size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-gray-800">Metode Pembayaran</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <Shield size={20} className="text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-gray-800">Keamanan & Privasi</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-center gap-3 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} className="text-red-600" />
          <span className="font-semibold text-red-600">Keluar</span>
        </button>
      </div>
    </div>
  );
}
