import { ArrowLeft, MapPin, Navigation, Phone, User, Clock, Bus } from 'lucide-react';

interface LiveTrackingProps {
  onBack: () => void;
}

export default function LiveTracking({ onBack }: LiveTrackingProps) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Map Header */}
      <div className="relative h-96 bg-gradient-to-br from-blue-400 to-blue-600">
        {/* Mock Map */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        {/* Bus Icon on Map */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#9dc847] shadow-lg flex items-center justify-center animate-pulse">
              <Bus size={32} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="20%"
            y1="80%"
            x2="80%"
            y2="20%"
            stroke="#9dc847"
            strokeWidth="3"
            strokeDasharray="10,5"
            opacity="0.6"
          />
        </svg>

        {/* Start Point */}
        <div className="absolute left-[20%] top-[80%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 rounded-full bg-green-500 border-4 border-white shadow-lg"></div>
        </div>

        {/* End Point */}
        <div className="absolute right-[20%] top-[20%] translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 rounded-full bg-red-500 border-4 border-white shadow-lg"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>

        {/* My Location Button */}
        <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10">
          <Navigation size={20} className="text-[#7fb52a]" />
        </button>
      </div>

      {/* Trip Info */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Status Card */}
        <div className="bg-white mx-6 -mt-8 rounded-2xl shadow-lg p-6 relative z-10 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Perjalanan</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-gray-800">Dalam Perjalanan</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-green-100 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Estimasi Tiba</p>
              <p className="text-lg font-bold text-green-800">45 menit</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Dari</p>
                  <p className="font-semibold text-gray-800">Terminal Kampung Rambutan</p>
                  <p className="text-sm text-gray-600">06:00 WIB</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-7">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Ke</p>
                  <p className="font-semibold text-gray-800">Terminal Leuwi Panjang</p>
                  <p className="text-sm text-gray-600">~09:30 WIB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white mx-6 rounded-2xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Driver</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9dc847] to-[#7fb52a] flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Budi Santoso</h4>
              <p className="text-sm text-gray-600">B 1234 XYZ</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.9)</span>
              </div>
            </div>
            <button className="w-12 h-12 rounded-full bg-[#9dc847] flex items-center justify-center hover:bg-[#8ab839] transition-colors">
              <Phone size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Trip Progress */}
        <div className="bg-white mx-6 rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Progres Perjalanan</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">Keberangkatan</p>
                  <span className="text-sm text-gray-500">06:00</span>
                </div>
                <p className="text-sm text-gray-600">Terminal Kampung Rambutan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 ml-4">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#9dc847] flex items-center justify-center animate-pulse">
                <Clock size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">Posisi Saat Ini</p>
                  <span className="text-sm text-gray-500">08:15</span>
                </div>
                <p className="text-sm text-gray-600">Rest Area KM 72</p>
              </div>
            </div>

            <div className="flex items-start gap-3 ml-4">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-400">Tujuan</p>
                  <span className="text-sm text-gray-400">~09:30</span>
                </div>
                <p className="text-sm text-gray-400">Terminal Leuwi Panjang</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
