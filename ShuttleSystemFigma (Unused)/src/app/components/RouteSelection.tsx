import { ArrowLeft, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface RouteSelectionProps {
  onBack: () => void;
  onSearch?: (from: string, to: string, date: string, passengers: number) => void;
}

export default function RouteSelection({ onBack, onSearch }: RouteSelectionProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('2026-05-20');
  const [passengers, setPassengers] = useState(1);

  const popularRoutes = [
    { from: 'Jakarta', to: 'Bandung', duration: '3.5 jam', price: 'Rp 75.000' },
    { from: 'Jakarta', to: 'Surabaya', duration: '10 jam', price: 'Rp 150.000' },
    { from: 'Surabaya', to: 'Malang', duration: '2.5 jam', price: 'Rp 50.000' },
    { from: 'Bandung', to: 'Yogyakarta', duration: '8 jam', price: 'Rp 120.000' },
  ];

  const cities = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Malang',
    'Yogyakarta',
    'Semarang',
    'Solo',
    'Bali'
  ];

  const handleSearch = () => {
    if (from && to) {
      onSearch?.(from, to, date, passengers);
    }
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 pt-6 pb-24 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Pilih Rute</h1>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* From */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Dari</label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9dc847] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Pilih kota keberangkatan</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={swapLocations}
              className="w-10 h-10 rounded-full bg-[#9dc847] flex items-center justify-center hover:bg-[#8ab839] transition-all transform hover:rotate-180 shadow-md"
            >
              <ArrowRight size={20} className="text-white rotate-90" />
            </button>
          </div>

          {/* To */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Ke</label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9dc847] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Pilih kota tujuan</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Tanggal Keberangkatan</label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9dc847] focus:border-transparent"
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2">Jumlah Penumpang</label>
            <div className="relative">
              <Users size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center py-3 border-x border-gray-200">
                  {passengers} orang
                </div>
                <button
                  onClick={() => setPassengers(Math.min(10, passengers + 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!from || !to}
            className="w-full py-3 bg-gradient-to-r from-[#9dc847] to-[#7fb52a] text-white rounded-lg font-semibold hover:from-[#8ab839] hover:to-[#6fa321] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cari Shuttle
          </button>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="flex-1 -mt-12 px-6 overflow-y-auto pb-24">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Rute Populer</h3>
          <div className="space-y-3">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  setFrom(route.from);
                  setTo(route.to);
                }}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#9dc847] hover:bg-[#9dc847]/5 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{route.from}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-800">{route.to}</span>
                  </div>
                  <span className="text-[#7fb52a] font-semibold">{route.price}</span>
                </div>
                <p className="text-sm text-gray-600">Durasi: {route.duration}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
