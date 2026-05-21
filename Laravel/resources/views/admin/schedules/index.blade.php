@extends('admin.layout')

@section('title', 'Manajemen Jadwal')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-primary">Daftar Jadwal Shuttle</h2>
    <a href="{{ route('admin.schedules.create') }}" class="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
        <span class="material-symbols-outlined">add</span>
        Tambah Jadwal
    </a>
</div>

<div class="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-outline-variant">
            <tr>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Rute</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Waktu</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Kendaraan / Supir</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
            @foreach($schedules as $schedule)
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">{{ $schedule->origin }} → {{ $schedule->destination }}</p>
                </td>
                <td class="px-6 py-4 text-on-surface-variant">
                    {{ \Carbon\Carbon::parse($schedule->departure_time)->format('d M Y, H:i') }}
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm font-medium text-primary">{{ $schedule->vehicle->name }}</p>
                    <p class="text-xs text-on-surface-variant">Supir: {{ $schedule->driver->name }}</p>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="text-on-surface-variant hover:text-primary">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
