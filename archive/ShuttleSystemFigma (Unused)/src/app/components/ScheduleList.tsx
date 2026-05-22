import { ArrowLeft, Bus, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface Schedule {
  id: string;
  route: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: string;
  availableSeats: number;
  totalSeats: number;
  busType: string;
}

interface ScheduleListProps {
  onBack: () => void;
  onSelectSchedule?: (schedule: Schedule) => void;
}

export default function ScheduleList({ onBack, onSelectSchedule }: ScheduleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-05-20');

  const schedules: Schedule[] = [
    {
      id: '1',
      route: 'Jakarta - Bandung',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Leuwi Panjang',
      departure: '06:00',
      arrival: '09:30',
      price: 'Rp 75.000',
      availableSeats: 15,
      totalSeats: 30,
      busType: 'Executive'
    },
    {
      id: '2',
      route: 'Jakarta - Bandung',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Leuwi Panjang',
      departure: '08:00',
      arrival: '11:30',
      price: 'Rp 75.000',
      availableSeats: 8,
      totalSeats: 30,
      busType: 'Executive'
    },
    {
      id: '3',
      route: 'Jakarta - Bandung',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Leuwi Panjang',
      departure: '10:00',
      arrival: '13:30',
      price: 'Rp 75.000',
      availableSeats: 22,
      totalSeats: 30,
      busType: 'Executive'
    },
    {
      id: '4',
      route: 'Jakarta - Surabaya',
      from: 'Terminal Kampung Rambutan',
      to: 'Terminal Purabaya',
      departure: '20:00',
      arrival: '06:00',
      price: 'Rp 150.000',
      availableSeats: 12,
      totalSeats: 40,
      busType: 'Sleeper'
    },
    {
      id: '5',
      route: 'Surabaya - Malang',
      from: 'Terminal Purabaya',
      to: 'Terminal Arjosari',
      departure: '14:00',
      arrival: '16:30',
      price: 'Rp 50.000',
      availableSeats: 18,
      totalSeats: 25,
      busType: 'Economy'
    }
  ];

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Jadwal Shuttle</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari rute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Date Selector */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        {/* Filter */}
        <button className="mb-4 px-4 py-2 bg-white rounded-lg shadow-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          <span>Filter & Urutkan</span>
        </button>

        {/* Schedule List */}
        <div className="space-y-4">
          {schedules
            .filter(s => s.route.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-xl shadow-sm p-4">
                {/* Route Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#9dc847]/10 flex items-center justify-center">
                      <Bus size={24} className="text-[#7fb52a]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{schedule.route}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {schedule.busType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#7fb52a]">{schedule.price}</p>
                  </div>
                </div>

                {/* Time & Route */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{schedule.departure}</span>
                    </div>
                    <p className="text-sm text-gray-600">{schedule.from}</p>
                  </div>
                  <div className="px-4 flex items-center">
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <Bus size={16} className="text-gray-400 mx-1" />
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{schedule.arrival}</span>
                      <Clock size={16} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{schedule.to}</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {schedule.availableSeats} kursi tersedia dari {schedule.totalSeats}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectSchedule?.(schedule)}
                    className="px-4 py-2 bg-[#9dc847] text-white rounded-lg font-medium hover:bg-[#8ab839] transition-colors"
                  >
                    Pilih
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
