import {
  ArrowLeft,
  Bus,
  Calendar,
  Users,
  MapPin,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({
  onBack,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "jadwal" | "kendaraan" | "booking"
  >("jadwal");

  const schedules = [
    {
      id: "1",
      route: "Jakarta - Bandung",
      time: "06:00",
      seats: "30",
      status: "active",
    },
    {
      id: "2",
      route: "Jakarta - Bandung",
      time: "08:00",
      seats: "30",
      status: "active",
    },
    {
      id: "3",
      route: "Surabaya - Malang",
      time: "14:00",
      seats: "25",
      status: "active",
    },
  ];

  const vehicles = [
    {
      id: "1",
      plate: "B 1234 XYZ",
      type: "Executive",
      seats: 30,
      status: "active",
    },
    {
      id: "2",
      plate: "B 5678 ABC",
      type: "Executive",
      seats: 30,
      status: "active",
    },
    {
      id: "3",
      plate: "L 9012 DEF",
      type: "Sleeper",
      seats: 40,
      status: "maintenance",
    },
  ];

  const bookings = [
    {
      id: "AMB001",
      passenger: "John Doe",
      route: "Jakarta - Bandung",
      seats: 2,
      status: "confirmed",
    },
    {
      id: "AMB002",
      passenger: "Jane Smith",
      route: "Surabaya - Malang",
      seats: 1,
      status: "pending",
    },
    {
      id: "AMB003",
      passenger: "Bob Johnson",
      route: "Jakarta - Bandung",
      seats: 3,
      status: "confirmed",
    },
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
          <h1 className="text-white text-xl font-semibold">
            Panel Admin
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <BarChart3 size={20} className="text-white mb-2" />
            <p className="text-white text-2xl font-bold">24</p>
            <p className="text-white/80 text-xs">
              Booking Hari Ini
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Bus size={20} className="text-white mb-2" />
            <p className="text-white text-2xl font-bold">8</p>
            <p className="text-white/80 text-xs">
              Shuttle Aktif
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Users size={20} className="text-white mb-2" />
            <p className="text-white text-2xl font-bold">156</p>
            <p className="text-white/80 text-xs">Penumpang</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("jadwal")}
            className={`py-4 border-b-2 transition-colors ${
              activeTab === "jadwal"
                ? "border-[#9dc847] text-[#7fb52a] font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            Jadwal
          </button>
          <button
            onClick={() => setActiveTab("kendaraan")}
            className={`py-4 border-b-2 transition-colors ${
              activeTab === "kendaraan"
                ? "border-[#9dc847] text-[#7fb52a] font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            Kendaraan
          </button>
          <button
            onClick={() => setActiveTab("booking")}
            className={`py-4 border-b-2 transition-colors ${
              activeTab === "booking"
                ? "border-[#9dc847] text-[#7fb52a] font-semibold"
                : "border-transparent text-gray-500"
            }`}
          >
            Booking
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        {activeTab === "jadwal" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Manajemen Jadwal
              </h3>
              <button className="px-4 py-2 bg-[#9dc847] text-white rounded-lg flex items-center gap-2 hover:bg-[#8ab839] transition-colors">
                <Plus size={18} />
                Tambah Jadwal
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar
                          size={24}
                          className="text-blue-600"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {schedule.route}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Jam: {schedule.time}
                        </p>
                        <p className="text-xs text-gray-500">
                          Kapasitas: {schedule.seats} kursi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {schedule.status}
                      </span>
                      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                        <Settings
                          size={18}
                          className="text-gray-600"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "kendaraan" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Manajemen Kendaraan
              </h3>
              <button className="px-4 py-2 bg-[#9dc847] text-white rounded-lg flex items-center gap-2 hover:bg-[#8ab839] transition-colors">
                <Plus size={18} />
                Tambah Kendaraan
              </button>
            </div>
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Bus
                          size={24}
                          className="text-orange-600"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {vehicle.plate}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tipe: {vehicle.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          Kapasitas: {vehicle.seats} kursi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                        <Settings
                          size={18}
                          className="text-gray-600"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "booking" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Monitoring Booking
              </h3>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Filter
              </button>
            </div>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {booking.id}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.passenger}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.route}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.seats} kursi
                      </p>
                    </div>
                    <button className="text-[#7fb52a] text-sm font-medium hover:underline">
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}