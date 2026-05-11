import { ArrowLeft, Bus, Check } from 'lucide-react';
import { useState } from 'react';

interface SeatSelectionProps {
  onBack: () => void;
  onConfirm?: (seats: string[], totalPrice: number) => void;
}

export default function SeatSelection({ onBack, onConfirm }: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const bookedSeats = ['A1', 'A3', 'B2', 'C4', 'D1', 'D3', 'E2'];

  const generateSeats = () => {
    const seats: { number: string; status: 'available' | 'booked' | 'selected' }[] = [];

    for (let row of ['A', 'B', 'C', 'D', 'E', 'F']) {
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${row}${col}`;
        let status: 'available' | 'booked' | 'selected' = 'available';

        if (bookedSeats.includes(seatNumber)) {
          status = 'booked';
        } else if (selectedSeats.includes(seatNumber)) {
          status = 'selected';
        }

        seats.push({ number: seatNumber, status });
      }
    }
    return seats;
  };

  const toggleSeat = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) {
      return; // Can't select booked seats
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const seats = generateSeats();
  const totalPrice = selectedSeats.length * 75000;

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
          <div className="flex-1">
            <h1 className="text-white text-xl font-semibold">Pilih Kursi</h1>
            <p className="text-white/80 text-sm">Jakarta - Bandung • 08:00 WIB</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <span className="text-sm text-gray-600">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#9dc847]"></div>
            <span className="text-sm text-gray-600">Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-400"></div>
            <span className="text-sm text-gray-600">Terisi</span>
          </div>
        </div>

        {/* Bus Layout */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Driver */}
          <div className="flex justify-end mb-6">
            <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center">
              <Bus size={24} className="text-gray-600" />
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => (
              <div key={row} className="flex gap-3 justify-center">
                {[1, 2, 3, 4].map((col, index) => {
                  const seatNumber = `${row}${col}`;
                  const seat = seats.find(s => s.number === seatNumber);

                  if (!seat) return null;

                  return (
                    <div key={seatNumber} className="flex gap-3">
                      {index === 2 && <div className="w-6"></div>}
                      <button
                        onClick={() => toggleSeat(seatNumber)}
                        className={`
                          w-14 h-14 rounded-lg font-semibold text-sm
                          transition-all transform active:scale-95
                          ${seat.status === 'available' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md' : ''}
                          ${seat.status === 'selected' ? 'bg-[#9dc847] text-white shadow-lg' : ''}
                          ${seat.status === 'booked' ? 'bg-gray-400 text-white cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        {seat.status === 'selected' ? (
                          <div className="flex items-center justify-center">
                            <Check size={20} />
                          </div>
                        ) : (
                          seatNumber
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 Pilih kursi yang Anda inginkan dengan tap pada nomor kursi
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Kursi Dipilih:</p>
                <p className="font-semibold text-gray-800">{selectedSeats.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-[#7fb52a]">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <button
              onClick={() => onConfirm?.(selectedSeats, totalPrice)}
              className="w-full py-3 bg-gradient-to-r from-[#9dc847] to-[#7fb52a] text-white rounded-lg font-semibold hover:from-[#8ab839] hover:to-[#6fa321] transition-all"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
