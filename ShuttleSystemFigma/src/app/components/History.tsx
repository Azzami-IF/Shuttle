import { ArrowLeft, Bus, Calendar, Star } from 'lucide-react';

interface HistoryItem {
  id: string;
  route: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  status: 'completed' | 'cancelled';
  rating?: number;
}

interface HistoryProps {
  onBack: () => void;
}

export default function History({ onBack }: HistoryProps) {
  const historyItems: HistoryItem[] = [
    {
      id: '1',
      route: 'Jakarta - Bandung',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Leuwi Panjang',
      date: '15 Mei 2026',
      time: '08:00 WIB',
      price: 'Rp 75.000',
      status: 'completed',
      rating: 5
    },
    {
      id: '2',
      route: 'Bandung - Jakarta',
      from: 'Terminal Leuwi Panjang',
      to: 'Terminal Kampung Rambutan',
      date: '10 Mei 2026',
      time: '14:00 WIB',
      price: 'Rp 75.000',
      status: 'completed',
      rating: 4
    },
    {
      id: '3',
      route: 'Jakarta - Surabaya',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Purabaya',
      date: '5 Mei 2026',
      time: '20:00 WIB',
      price: 'Rp 150.000',
      status: 'completed',
      rating: 5
    },
    {
      id: '4',
      route: 'Surabaya - Malang',
      from: 'Terminal Purabaya',
      to: 'Terminal Arjosari',
      date: '1 Mei 2026',
      time: '10:00 WIB',
      price: 'Rp 50.000',
      status: 'cancelled'
    }
  ];

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Riwayat Perjalanan</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Total Perjalanan</p>
            <p className="text-white text-2xl font-bold">
              {historyItems.filter(i => i.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Points Earned</p>
            <p className="text-white text-2xl font-bold">250</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Rating Rata-rata</p>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <p className="text-white text-xl font-bold">4.7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Bus size={24} className={item.status === 'completed' ? 'text-green-600' : 'text-red-600'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.route}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar size={14} />
                      <span>{item.date} • {item.time}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="text-gray-600">Dari: {item.from}</p>
                      <p className="text-gray-600">Ke: {item.to}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </span>
                  {item.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < item.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">{item.price}</p>
                  <button className="text-[#7fb52a] text-sm font-medium mt-1">Detail</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
