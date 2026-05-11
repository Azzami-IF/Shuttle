import { ArrowLeft, Bus, MapPin, Clock, QrCode, ChevronRight } from 'lucide-react';

interface Ticket {
  id: string;
  route: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  status: 'upcoming' | 'active' | 'completed';
  bookingCode: string;
}

interface MyTicketsProps {
  onBack: () => void;
}

export default function MyTickets({ onBack }: MyTicketsProps) {
  const tickets: Ticket[] = [
    {
      id: '1',
      route: 'Jakarta - Bandung',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Leuwi Panjang',
      date: '20 Mei 2026',
      time: '08:00 WIB',
      seat: 'A12',
      price: 'Rp 75.000',
      status: 'upcoming',
      bookingCode: 'AMB2026051001'
    },
    {
      id: '2',
      route: 'Surabaya - Malang',
      from: 'Terminal Purabaya',
      to: 'Terminal Arjosari',
      date: '25 Mei 2026',
      time: '14:00 WIB',
      seat: 'B8',
      price: 'Rp 50.000',
      status: 'upcoming',
      bookingCode: 'AMB2026051002'
    }
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
          <h1 className="text-white text-xl font-semibold">Tiket Saya</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg">
          <button className="flex-1 py-2 bg-[#9dc847] text-white rounded-lg font-medium transition-all">
            Aktif ({tickets.length})
          </button>
          <button className="flex-1 py-2 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-all">
            Selesai
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-[#9dc847] to-[#7fb52a] p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Kode Booking</span>
                  <span className="font-semibold">{ticket.bookingCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus size={20} />
                    <span className="font-semibold">{ticket.route}</span>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                    {ticket.status === 'upcoming' ? 'Akan Datang' : 'Aktif'}
                  </span>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#9dc847]"></div>
                        <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                        <div className="w-3 h-3 rounded-full border-2 border-[#9dc847]"></div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-4">
                          <p className="text-gray-500 text-xs mb-1">Keberangkatan</p>
                          <p className="font-semibold text-gray-800">{ticket.from}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{ticket.date} • {ticket.time}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Tujuan</p>
                          <p className="font-semibold text-gray-800">{ticket.to}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nomor Kursi</p>
                    <p className="font-semibold text-gray-800">{ticket.seat}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Bayar</p>
                    <p className="font-semibold text-[#7fb52a] text-lg">{ticket.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 border border-[#9dc847] text-[#7fb52a] rounded-lg font-medium hover:bg-[#9dc847]/5 transition-all flex items-center justify-center gap-2">
                    <QrCode size={18} />
                    E-Ticket
                  </button>
                  <button className="flex-1 py-2 bg-[#9dc847] text-white rounded-lg font-medium hover:bg-[#8ab839] transition-all flex items-center justify-center gap-2">
                    Detail
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bus size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Belum ada tiket aktif</p>
          </div>
        )}
      </div>
    </div>
  );
}
