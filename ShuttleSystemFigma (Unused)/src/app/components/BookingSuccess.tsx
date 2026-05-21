import { CheckCircle, Download, Share2, Home } from 'lucide-react';

interface BookingSuccessProps {
  onBack: () => void;
  bookingId: string;
}

export default function BookingSuccess({ onBack, bookingId }: BookingSuccessProps) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Success Animation */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <CheckCircle size={60} className="text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Tiket Anda telah berhasil dibooking. Cek email untuk konfirmasi.
          </p>

          {/* Booking ID */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Kode Booking</p>
            <p className="text-2xl font-bold text-[#7fb52a] mb-4">{bookingId}</p>
            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              {/* QR Code Placeholder */}
              <div className="grid grid-cols-8 gap-1">
                {[...Array(64)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${
                      Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Tunjukkan kode ini saat boarding
            </p>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Detail Perjalanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rute</span>
                <span className="font-medium text-gray-800">Jakarta - Bandung</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal</span>
                <span className="font-medium text-gray-800">20 Mei 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu</span>
                <span className="font-medium text-gray-800">08:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kursi</span>
                <span className="font-medium text-gray-800">A12, A13</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-gradient-to-r from-[#9dc847] to-[#7fb52a] text-white rounded-lg font-semibold hover:from-[#8ab839] hover:to-[#6fa321] transition-all flex items-center justify-center gap-2">
              <Download size={20} />
              Download E-Ticket
            </button>
            <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <Share2 size={20} />
              Bagikan Tiket
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
