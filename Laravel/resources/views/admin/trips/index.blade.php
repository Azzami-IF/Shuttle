@extends('admin.layout')

@section('title', 'Monitoring Perjalanan')

@section('content')
<!-- Include Leaflet Assets -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<div class="flex flex-col gap-6">
    <div>
        <h1 class="text-2xl font-bold text-primary">Monitoring Perjalanan</h1>
        <p class="text-sm text-on-surface-variant">Pantau posisi armada bus aktif, rute historis, dan status operasional supir di lapangan.</p>
    </div>

    <!-- Active Trips Map & Passenger Details (2-column layout) -->
    <div class="flex flex-col lg:flex-row gap-6">
        <!-- Peta Kiri -->
        <div class="flex-grow bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 class="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">map</span>
                Peta Pelacakan Armada Aktif (Real-Time & Historis)
            </h2>
            <div id="admin-map" style="width: 100%; height: 500px; border-radius: 8px; z-index: 1;"></div>
        </div>

        <!-- Passenger Details Kanan -->
        <div class="w-full lg:w-[400px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 hidden flex-col" id="passenger-panel">
            <h2 class="font-bold text-base mb-3 text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">groups</span>
                Detail Penumpang
            </h2>
            <div class="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div class="text-xs font-semibold text-gray-500">TRIP ID <span id="panel-trip-id" class="text-gray-900 ml-2"></span></div>
                <div class="text-sm font-bold text-gray-800" id="panel-trip-route"></div>
                <div class="text-xs text-gray-600">Sopir: <span id="panel-trip-driver" class="font-medium text-gray-900"></span></div>
                <div class="text-xs text-gray-600">Unit: <span id="panel-trip-vehicle" class="font-medium text-gray-900"></span></div>
                <div class="mt-1"><span id="panel-trip-status"></span></div>
            </div>

            <div class="flex-grow overflow-y-auto">
                <h3 class="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Daftar Penumpang</h3>
                <ul id="passenger-list" class="flex flex-col gap-2">
                    <!-- Dinamis terisi dari JS -->
                </ul>
            </div>
        </div>
    </div>

    <!-- Trips History Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div class="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <h2 class="font-bold text-base text-primary">Daftar Operasional Perjalanan</h2>
            <form method="GET" action="{{ route('admin.trips') }}" class="w-full md:w-48">
                <select name="status" onchange="this.form.submit()" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                    <option value="">Semua Status</option>
                    <option value="scheduled" {{ request('status') === 'scheduled' ? 'selected' : '' }}>Scheduled</option>
                    <option value="boarding" {{ request('status') === 'boarding' ? 'selected' : '' }}>Boarding</option>
                    <option value="on-going" {{ request('status') === 'on-going' ? 'selected' : '' }}>On-going</option>
                    <option value="arrived" {{ request('status') === 'arrived' ? 'selected' : '' }}>Arrived</option>
                    <option value="delayed" {{ request('status') === 'delayed' ? 'selected' : '' }}>Delayed</option>
                    <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                </select>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-on-surface-variant">
                        <th class="px-6 py-4">ID Perjalanan</th>
                        <th class="px-6 py-4">Pengemudi & Unit</th>
                        <th class="px-6 py-4">Rute</th>
                        <th class="px-6 py-4">Keberangkatan</th>
                        <th class="px-6 py-4">Lokasi Terkini</th>
                        <th class="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                    @forelse($trips as $trip)
                        @php
                            $latestLoc = $trip->locations->last();
                        @endphp
                        <tr class="hover:bg-gray-50 cursor-pointer" onclick="focusTripOnMap({{ $trip->id }})">
                            <td class="px-6 py-4 font-semibold">#TRP{{ $trip->id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ $trip->schedule?->driver?->name }}</div>
                                <div class="text-xs text-gray-500">{{ $trip->schedule?->vehicle?->name }} ({{ $trip->schedule?->vehicle?->license_plate }})</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ $trip->schedule?->origin }} → {{ $trip->schedule?->destination }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-gray-900">{{ \Carbon\Carbon::parse($trip->schedule?->departure_time)->format('H:mm') }}</div>
                                <div class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($trip->schedule?->departure_time)->format('d M Y') }}</div>
                            </td>
                            <td class="px-6 py-4 font-mono text-xs">
                                @if($latestLoc)
                                    <span class="text-secondary">{{ $latestLoc->latitude }}, {{ $latestLoc->longitude }}</span>
                                    <div class="text-[10px] text-gray-400">Update: {{ $latestLoc->created_at->format('H:mm:s') }}</div>
                                @else
                                    <span class="text-gray-400">Belum ada sinyal GPS</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                @if($trip->status === 'scheduled')
                                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>
                                @elseif(in_array($trip->status, ['on-going', 'boarding', 'delayed', 'arrived']))
                                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">{{ ucfirst($trip->status) }}</span>
                                @elseif($trip->status === 'completed')
                                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Completed</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                <span class="material-symbols-outlined text-4xl block mb-2">route</span>
                                Tidak ada data perjalanan ditemukan.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    let map;
    const tripDataMap = {};
    const tripMarkers = {};
    const tripPolylines = {};

    document.addEventListener("DOMContentLoaded", function() {
        // Initialize Map centered on West Java (between Jakarta and Bandung)
        map = L.map('admin-map').setView([-6.6, 107.2], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Fetch active trips locations generated from backend php
        const activeTrips = [
            @foreach($trips->whereIn('status', ['boarding', 'on-going', 'delayed', 'arrived']) as $t)
                {
                    id: {{ $t->id }},
                    origin: '{{ addslashes($t->schedule?->origin) }}',
                    destination: '{{ addslashes($t->schedule?->destination) }}',
                    driver: '{{ addslashes($t->schedule?->driver?->name) }}',
                    vehicle: '{{ addslashes($t->schedule?->vehicle?->license_plate) }}',
                    status: '{{ $t->status }}',
                    locations: [
                        @foreach($t->locations as $loc)
                            [{{ $loc->latitude }}, {{ $loc->longitude }}],
                        @endforeach
                    ],
                    passengers: [
                        @foreach($t->schedule->bookings as $booking)
                            {
                                name: '{{ addslashes($booking->user->name) }}',
                                seat: '{{ $booking->seat_number }}',
                                phone: '{{ addslashes($booking->user->phone) }}'
                            },
                        @endforeach
                    ]
                },
            @endforeach
        ];

        const markersGroup = [];

        if (activeTrips.length === 0) {
            // Add a default placeholder marker if map is empty
            const placeholderMarker = L.marker([-6.9452, 107.5937])
                .addTo(map)
                .bindPopup("<b>Depot Pusat Bandung</b><br>Tidak ada armada bus aktif saat ini.")
                .openPopup();
        } else {
            activeTrips.forEach(trip => {
                tripDataMap[trip.id] = trip;

                if (trip.locations.length > 0) {
                    const latestLoc = trip.locations[trip.locations.length - 1];

                    const originName = trip.origin.toLowerCase().trim();
                    const destName = trip.destination.toLowerCase().trim();
                    const coordinatesMap = {
                        'jakarta': [-6.3090, 106.8824],
                        'karawang': [-6.3073, 107.2913],
                        'sumedang': [-6.8524, 107.9234],
                        'bandung': [-6.9452, 107.5937],
                        'subang': [-6.5715, 107.7587],
                        'purwakarta': [-6.5571, 107.4431]
                    };
                    const originCoords = coordinatesMap[originName] || [-6.9452, 107.5937];
                    const destCoords = coordinatesMap[destName] || [-6.3090, 106.8824];

                    fetch(`https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.routes && data.routes.length > 0) {
                                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                                const plannedPath = L.polyline(coords, { color: '#94a3b8', weight: 3, opacity: 0.5, dashArray: '5, 10' }).addTo(map);
                                markersGroup.push(plannedPath);
                            }
                        });

                    // Polyline history (Actual path taken)
                    const polyline = L.polyline(trip.locations, { color: '#0d9488', weight: 4, opacity: 0.9 }).addTo(map);
                    tripPolylines[trip.id] = polyline;

                    const busIcon = L.divIcon({
                        className: 'custom-bus-icon',
                        html: `<div style="background-color:#18281e; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.4); text-align:center;">
                                 <span class="material-symbols-outlined" style="font-size:16px; display:block;">directions_bus</span>
                               </div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    });

                    const marker = L.marker(latestLoc, { icon: busIcon })
                        .addTo(map)
                        .bindPopup(`
                            <div class="text-xs p-1">
                                <b class="text-sm">Armada: ${trip.vehicle}</b><br>
                                <b>Rute:</b> ${trip.origin} → ${trip.destination}<br>
                                <b>Driver:</b> ${trip.driver}<br>
                                <b>Status:</b> ${trip.status.toUpperCase()}<br>
                                <button onclick="showPassengerPanel(${trip.id})" class="mt-2 w-full px-2 py-1 bg-primary text-white rounded text-xs">Lihat Penumpang</button>
                            </div>
                        `);
                    
                    marker.on('click', () => {
                        showPassengerPanel(trip.id);
                    });

                    tripMarkers[trip.id] = marker;
                    markersGroup.push(marker);
                    markersGroup.push(polyline);
                }
            });

            // Adjust bounds if multiple active trips
            if (markersGroup.length > 0) {
                const group = new L.featureGroup(markersGroup);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }

        // Real-time location polling every 5 seconds
        setInterval(function() {
            fetch("{{ route('admin.trips.locations') }}")
                .then(res => res.json())
                .then(data => {
                    data.forEach(trip => {
                        // Update internal data map
                        tripDataMap[trip.id] = trip;

                        if (trip.locations.length > 0) {
                            const latestLoc = trip.locations[trip.locations.length - 1];

                            // Update marker position
                            if (tripMarkers[trip.id]) {
                                tripMarkers[trip.id].setLatLng(latestLoc);
                                
                                // Update popup content dynamically
                                tripMarkers[trip.id].getPopup().setContent(`
                                    <div class="text-xs p-1">
                                        <b class="text-sm">Armada: ${trip.vehicle}</b><br>
                                        <b>Rute:</b> ${trip.origin} → ${trip.destination}<br>
                                        <b>Driver:</b> ${trip.driver}<br>
                                        <b>Status:</b> ${trip.status.toUpperCase()}<br>
                                        <button onclick="showPassengerPanel(${trip.id})" class="mt-2 w-full px-2 py-1 bg-primary text-white rounded text-xs">Lihat Penumpang</button>
                                    </div>
                                `);
                            } else {
                                // Create new marker if it didn't exist
                                const busIcon = L.divIcon({
                                    className: 'custom-bus-icon',
                                    html: `<div style="background-color:#18281e; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.4); text-align:center;">
                                             <span class="material-symbols-outlined" style="font-size:16px; display:block;">directions_bus</span>
                                           </div>`,
                                    iconSize: [28, 28],
                                    iconAnchor: [14, 14]
                                });

                                const marker = L.marker(latestLoc, { icon: busIcon })
                                    .addTo(map)
                                    .bindPopup(`
                                        <div class="text-xs p-1">
                                            <b class="text-sm">Armada: ${trip.vehicle}</b><br>
                                            <b>Rute:</b> ${trip.origin} → ${trip.destination}<br>
                                            <b>Driver:</b> ${trip.driver}<br>
                                            <b>Status:</b> ${trip.status.toUpperCase()}<br>
                                            <button onclick="showPassengerPanel(${trip.id})" class="mt-2 w-full px-2 py-1 bg-primary text-white rounded text-xs">Lihat Penumpang</button>
                                        </div>
                                    `);
                                
                                marker.on('click', () => {
                                    showPassengerPanel(trip.id);
                                });
                                tripMarkers[trip.id] = marker;
                            }

                            // Update polyline coordinates
                            if (tripPolylines[trip.id]) {
                                tripPolylines[trip.id].setLatLngs(trip.locations);
                            } else {
                                const polyline = L.polyline(trip.locations, { color: '#0d9488', weight: 4, opacity: 0.9 }).addTo(map);
                                tripPolylines[trip.id] = polyline;
                            }
                        }
                    });

                    // Refresh active passenger panel if it is currently open
                    const activePanelIdElement = document.getElementById('panel-trip-id');
                    if (activePanelIdElement && activePanelIdElement.textContent) {
                        const activePanelId = activePanelIdElement.textContent;
                        if (activePanelId && !document.getElementById('passenger-panel').classList.contains('hidden')) {
                            const tripIdNum = parseInt(activePanelId.replace('#TRP', ''), 10);
                            if (tripIdNum && tripDataMap[tripIdNum]) {
                                showPassengerPanel(tripIdNum);
                            }
                        }
                    }
                })
                .catch(err => console.error("Error polling locations:", err));
        }, 5000);
    });

    function showPassengerPanel(tripId) {
        const trip = tripDataMap[tripId];
        if (!trip) return;

        document.getElementById('passenger-panel').classList.remove('hidden');
        document.getElementById('passenger-panel').classList.add('flex');

        document.getElementById('panel-trip-id').textContent = `#TRP${trip.id}`;
        document.getElementById('panel-trip-route').textContent = `${trip.origin} → ${trip.destination}`;
        document.getElementById('panel-trip-driver').textContent = trip.driver;
        document.getElementById('panel-trip-vehicle').textContent = trip.vehicle;
        
        let statusBadge = '';
        if(trip.status === 'on-going') statusBadge = '<span class="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">ON-GOING</span>';
        else if(trip.status === 'delayed') statusBadge = '<span class="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">DELAYED</span>';
        else if(trip.status === 'boarding') statusBadge = '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">BOARDING</span>';
        else if(trip.status === 'arrived') statusBadge = '<span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">ARRIVED</span>';
        
        document.getElementById('panel-trip-status').innerHTML = statusBadge;

        const list = document.getElementById('passenger-list');
        list.innerHTML = '';

        if (trip.passengers.length === 0) {
            list.innerHTML = '<li class="text-xs text-gray-500 text-center py-4">Tidak ada data penumpang</li>';
            return;
        }

        trip.passengers.forEach(p => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center bg-white border border-gray-100 p-2 rounded";
            li.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-800">${p.name}</span>
                    <span class="text-[10px] text-gray-500">${p.phone}</span>
                </div>
                <div class="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                    Seat ${p.seat}
                </div>
            `;
            list.appendChild(li);
        });
    }

    function focusTripOnMap(tripId) {
        if (tripMarkers[tripId]) {
            map.setView(tripMarkers[tripId].getLatLng(), 13);
            tripMarkers[tripId].openPopup();
            showPassengerPanel(tripId);
        }
    }
</script>
@endsection
