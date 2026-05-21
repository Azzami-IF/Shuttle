@extends('admin.layout')

@section('title', 'Manajemen Kendaraan')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-primary">Daftar Kendaraan</h2>
    <a href="{{ route('admin.vehicles.create') }}" class="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
        <span class="material-symbols-outlined">add</span>
        Tambah Kendaraan
    </a>
</div>

<div class="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-outline-variant">
            <tr>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Nama Kendaraan</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">No. Plat</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-center">Kapasitas</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
            @foreach($vehicles as $vehicle)
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">{{ $vehicle->name }}</p>
                </td>
                <td class="px-6 py-4 text-on-surface-variant">
                    {{ $vehicle->license_plate }}
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-secondary-container text-secondary px-3 py-1 rounded-full text-xs font-bold">{{ $vehicle->capacity }} Kursi</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="text-on-surface-variant hover:text-primary mr-3">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="text-red-500 hover:text-red-700">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
