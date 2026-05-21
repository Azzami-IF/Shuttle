@extends('admin.layout')

@section('title', 'Manajemen Pengguna')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-primary">Manajemen Pengguna & Supir</h2>
</div>

<div class="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-outline-variant">
            <tr>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Nama</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Email / No. Telp</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Peran</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
            @foreach($users as $user)
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">{{ $user->name }}</p>
                </td>
                <td class="px-6 py-4 text-on-surface-variant">
                    <p>{{ $user->email }}</p>
                    <p class="text-xs">{{ $user->phone }}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold {{ $user->role === 'admin' ? 'bg-red-100 text-red-700' : ($user->role === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700') }}">
                        {{ strtoupper($user->role) }}
                    </span>
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
