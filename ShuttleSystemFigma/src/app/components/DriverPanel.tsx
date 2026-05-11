import { ArrowLeft, MapPin, Users, Clock, Navigation, Phone, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface DriverPanelProps {
  onBack: () => void;
}

export default function DriverPanel({ onBack }: DriverPanelProps) {
  const [tripStatus, setTripStatus] = useState<'scheduled' | 'on-going' | 'completed'>('on-going');
  const [isSharing, setIsSharing] = useState(true);

  const currentTrip = {
    id: 'TRP001',
    route: 'Jakarta - Bandung',
    from: 'Terminal Kampung Rambutan',
    to: 'Terminal Leuwi Panjang',
    departure: '08:00 WIB',
    estimatedArrival: '11:30 WIB',
    passengers: 22,
    totalSeats: 30
  };

  const passengers = [
    { name: 'John Doe', seat: 'A12', phone: '0812-3456-7890', status: 'boarded' },
    { name: 'Jane Smith', seat: 'B8', phone: '0812-3456-7891', status: 'boarded' },
    { name: 'Bob Johnson', seat: 'C5', phone: '0812-3456-7892', status: 'waiting' },
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
          <div className="flex-1">
            <h1 className="text-white text-xl font-semibold">Panel Driver</h1>
            <p className="text-white/80 text-sm">Trip ID: {currentTrip.id}</p>
          </div>
        </div>

        {/* Trip Info */}
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">{currentTrip.route}</h3>
            <select
              value={tripStatus}
              onChange={(e) => setTripStatus(e.target.value as any)}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-800"
            >
              <option value="scheduled">Scheduled</option>
              <option value="on-going">On-Going</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/70 text-xs mb-1">Keberangkatan</p>
              <p className="text-white text-sm">{currentTrip.departure}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">Est. Tiba</p>
              <p className="text-white text-sm">{currentTrip.estimatedArrival}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        {/* Location Sharing */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation size={20} className="text-[#7fb52a]" />
              <h3 className="font-semibold text-gray-800">Bagikan Lokasi</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSharing}
                onChange={(e) => setIsSharing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9dc847]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9dc847]"></div>
            </label>
          </div>
          {isSharing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-800">Lokasi sedang dibagikan secara real-time</p>
              </div>
            </div>
          )}
        </div>

        {/* Passenger Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Informasi Penumpang</h3>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-400" />
              <span className="font-semibold text-gray-800">
                {currentTrip.passengers}/{currentTrip.totalSeats}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {passengers.map((passenger, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#9dc847]/20 flex items-center justify-center">
                    <span className="font-semibold text-[#7fb52a]">{passenger.seat}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{passenger.name}</p>
                    <p className="text-xs text-gray-500">{passenger.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    passenger.status === 'boarded'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {passenger.status === 'boarded' ? 'Naik' : 'Menunggu'}
                  </span>
                  <button className="w-8 h-8 rounded-lg bg-[#9dc847] flex items-center justify-center hover:bg-[#8ab839] transition-colors">
                    <Phone size={16} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Rute Perjalanan</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Keberangkatan</p>
                <p className="text-sm text-gray-600">{currentTrip.from}</p>
                <p className="text-xs text-gray-500 mt-1">{currentTrip.departure}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 ml-4">
              <div className="w-px h-12 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Tujuan</p>
                <p className="text-sm text-gray-600">{currentTrip.to}</p>
                <p className="text-xs text-gray-500 mt-1">Est. {currentTrip.estimatedArrival}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Darurat</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Hubungi dispatch center jika terjadi keadaan darurat
          </p>
          <button className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Hubungi Dispatch: 0800-1234-5678
          </button>
        </div>
      </div>
    </div>
  );
}
