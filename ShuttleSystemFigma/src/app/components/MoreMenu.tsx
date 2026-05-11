import { ArrowLeft, Shield, Truck, Settings, HelpCircle, FileText, Star, LogOut } from 'lucide-react';

interface MoreMenuProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function MoreMenu({ onBack, onNavigate, onLogout }: MoreMenuProps) {
  const menuItems = [
    {
      id: 'admin',
      icon: Shield,
      title: 'Panel Admin',
      description: 'Kelola jadwal, kendaraan & booking',
      color: 'bg-purple-100 text-purple-600',
      action: () => onNavigate('admin')
    },
    {
      id: 'driver',
      icon: Truck,
      title: 'Panel Driver',
      description: 'Update lokasi & status perjalanan',
      color: 'bg-blue-100 text-blue-600',
      action: () => onNavigate('driver')
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Pengaturan',
      description: 'Atur preferensi aplikasi',
      color: 'bg-gray-100 text-gray-600',
      action: () => {}
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'Bantuan & FAQ',
      description: 'Dapatkan bantuan penggunaan',
      color: 'bg-green-100 text-green-600',
      action: () => {}
    },
    {
      id: 'terms',
      icon: FileText,
      title: 'Syarat & Ketentuan',
      description: 'Baca kebijakan kami',
      color: 'bg-yellow-100 text-yellow-600',
      action: () => {}
    },
    {
      id: 'rate',
      icon: Star,
      title: 'Beri Rating',
      description: 'Bantu kami menjadi lebih baik',
      color: 'bg-orange-100 text-orange-600',
      action: () => {}
    },
  ];

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Menu Lainnya</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        <div className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-6 bg-white rounded-xl shadow-sm p-4 hover:bg-red-50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <LogOut size={24} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-red-600">Keluar</h3>
              <p className="text-sm text-red-500">Logout dari akun Anda</p>
            </div>
          </div>
        </button>

        {/* App Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Ambatu Bus v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">© 2026 Ambatu Bus. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
