@extends('admin.layout')

@section('title', 'Monitoring Pemesanan')

@section('content')
<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-bold text-primary">Monitoring Pemesanan</h1>
            <p class="text-sm text-on-surface-variant">Daftar semua transaksi tiket dan status pembayaran penumpang.</p>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form method="GET" action="{{ route('admin.bookings') }}" class="flex flex-col md:flex-row gap-3 w-full">
            <div class="flex-1">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama penumpang, asal, atau tujuan..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary text-sm"/>
            </div>
            <div class="w-full md:w-48">
                <select name="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary text-sm">
                    <option value="">Semua Status</option>
                    <option value="pending_payment" {{ request('status') === 'pending_payment' ? 'selected' : '' }}>Pending Payment</option>
                    <option value="booked" {{ request('status') === 'booked' ? 'selected' : '' }}>Booked / Paid</option>
                    <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                    <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                </select>
            </div>
            <button type="submit" class="bg-secondary text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90">
                Filter
            </button>
            @if(request()->has('search') || request()->has('status'))
                <a href="{{ route('admin.bookings') }}" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center">
                    Reset
                </a>
            @endif
        </form>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-on-surface-variant">
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Penumpang</th>
                        <th class="px-6 py-4">Rute & Jadwal</th>
                        <th class="px-6 py-4">Kursi</th>
                        <th class="px-6 py-4">Kode Bayar</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                    @forelse($bookings as $booking)
                        <tr>
                            <td class="px-6 py-4 font-semibold">#TCK{{ $booking->id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ $booking->user?->name }}</div>
                                <div class="text-xs text-gray-500">{{ $booking->user?->email }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ $booking->schedule?->origin }} → {{ $booking->schedule?->destination }}</div>
                                <div class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($booking->schedule?->departure_time)->format('d M Y H:mm') }}</div>
                            </td>
                            <td class="px-6 py-4 font-semibold text-secondary">
                                Kursi {{ $booking->seat?->seat_number }}
                            </td>
                            <td class="px-6 py-4 font-mono text-xs text-gray-600">
                                {{ $booking->payment_code }}
                            </td>
                            <td class="px-6 py-4">
                                @if($booking->status === 'pending_payment')
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Payment</span>
                                @elseif($booking->status === 'booked')
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Lunas / Booked</span>
                                @elseif($booking->status === 'cancelled')
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Batal / Expired</span>
                                @elseif($booking->status === 'completed')
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Selesai</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                @if($booking->status === 'pending_payment')
                                    <form action="{{ route('admin.bookings.confirm', $booking->id) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">
                                            Konfirmasi Bayar
                                        </button>
                                    </form>
                                @else
                                    <span class="text-gray-400 text-xs">-</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                <span class="material-symbols-outlined text-4xl block mb-2">inbox</span>
                                Tidak ada data pemesanan ditemukan.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
