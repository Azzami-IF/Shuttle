import { ArrowLeft, Bus, Users, Calendar, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface AvailabilityCheckProps {
  onBack: () => void;
}

export default function AvailabilityCheck({ onBack }: AvailabilityCheckProps) {
  const availabilityData = [
    {
      id: '1',
      route: 'Jakarta - Bandung',
      time: '06:00',
      date: '20 Mei 2026',
      available: 15,
      total: 30,
      percentage: 50,
      trend: 'up'
    },
    {
      id: '2',
      route: 'Jakarta - Bandung',
      time: '08:00',
      date: '20 Mei 2026',
      available: 8,
      total: 30,
      percentage: 27,
      trend: 'down'
    },
    {
      id: '3',
      route: 'Jakarta - Bandung',
      time: '10:00',
      date: '20 Mei 2026',
      available: 22,
      total: 30,
      percentage: 73,
      trend: 'up'
    },
    {
      id: '4',
      route: 'Jakarta - Surabaya',
      time: '20:00',
      date: '20 Mei 2026',
      available: 12,
      total: 40,
      percentage: 30,
      trend: 'down'
    },
    {
      id: '5',
      route: 'Surabaya - Malang',
      time: '14:00',
      date: '20 Mei 2026',
      available: 18,
      total: 25,
      percentage: 72,
      trend: 'up'
    },
    {
      id: '6',
      route: 'Bandung - Jakarta',
      time: '15:00',
      date: '20 Mei 2026',
      available: 5,
      total: 30,
      percentage: 17,
      trend: 'down'
    },
  ];

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 60) return 'text-green-600 bg-green-100';
    if (percentage >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

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
          <h1 className="text-white text-xl font-semibold">Ketersediaan Kursi</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Total Shuttle</p>
            <p className="text-white text-2xl font-bold">6</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Kursi Tersedia</p>
            <p className="text-white text-2xl font-bold">80</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">Occupancy</p>
            <p className="text-white text-2xl font-bold">56%</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        <div className="space-y-4">
          {availabilityData.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[#9dc847]/10 flex items-center justify-center">
                    <Bus size={24} className="text-[#7fb52a]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.route}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{item.date} • {item.time}</span>
                    </div>
                  </div>
                </div>
                {item.trend === 'up' ? (
                  <TrendingUp size={20} className="text-green-500" />
                ) : (
                  <TrendingDown size={20} className="text-red-500" />
                )}
              </div>

              {/* Availability Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Ketersediaan</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.available}/{item.total} kursi
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.percentage >= 60 ? 'bg-green-500' :
                      item.percentage >= 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(item.percentage)}`}>
                  {item.percentage >= 60 ? 'Banyak Tersedia' :
                   item.percentage >= 30 ? 'Terbatas' :
                   'Hampir Penuh'}
                </span>
                <button className="text-[#7fb52a] font-medium text-sm hover:underline">
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
