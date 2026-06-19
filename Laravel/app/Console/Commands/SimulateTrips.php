<?php

namespace App\Console\Commands;

use App\Models\Trip;
use App\Models\Location;
use Illuminate\Console\Command;

class SimulateTrips extends Command
{
    protected $signature = 'trips:simulate {--interval=3 : Interval update dalam detik}';
    protected $description = 'Simulasikan pergerakan bus real-time untuk trip yang sedang berlangsung (on-going)';

    public function handle()
    {
        $interval = (int) $this->option('interval');
        $this->info("Memulai simulasi pergerakan bus (Update setiap {$interval} detik)...");
        $this->info("Tekan Ctrl+C untuk menghentikan.");

        $coordinates = [
            'jakarta' => [-6.3090, 106.8824],
            'bandung' => [-6.9452, 107.5937],
            'karawang' => [-6.3073, 107.2913],
            'sumedang' => [-6.8524, 107.9234],
            'subang' => [-6.5715, 107.7587],
            'purwakarta' => [-6.5571, 107.4431],
            'cikampek' => [-6.4025, 107.4589],
            'cirebon' => [-6.7320, 108.5523],
            'bogor' => [-6.5971, 106.7932],
            'depok' => [-6.4025, 106.8227],
            'bekasi' => [-6.2383, 106.9756],
        ];

        while (true) {
            // Ambil semua trip yang statusnya 'on-going' atau 'scheduled'
            $trips = Trip::whereIn('status', ['on-going', 'scheduled'])->with('schedule')->get();

            if ($trips->isEmpty()) {
                $this->comment("Menunggu trip aktif (status: scheduled atau on-going)...");
            } else {
                foreach ($trips as $trip) {
                    // Otomatis aktifkan trip scheduled ke on-going agar simulasi berjalan
                    if ($trip->status === 'scheduled') {
                        $trip->update(['status' => 'on-going']);
                        $this->info("Trip #{$trip->id} ({$trip->schedule->origin} ➔ {$trip->schedule->destination}) otomatis diaktifkan menjadi ON-GOING!");
                    }

                    $originName = strtolower(trim($trip->schedule->origin));
                    $destName = strtolower(trim($trip->schedule->destination));

                    $originCoords = $coordinates[$originName] ?? null;
                    $destCoords = $coordinates[$destName] ?? null;

                    if (!$originCoords || !$destCoords) {
                        $this->warn("Trip #{$trip->id}: Koordinat rute {$trip->schedule->origin} -> {$trip->schedule->destination} tidak terdefinisi.");
                        continue;
                    }

                    // Ambil lokasi terakhir
                    $lastLoc = $trip->locations()->latest()->first();

                    if (!$lastLoc) {
                        // Jika belum ada lokasi, buat di posisi asal
                        $currentLat = $originCoords[0];
                        $currentLng = $originCoords[1];
                    } else {
                        $currentLat = $lastLoc->latitude;
                        $currentLng = $lastLoc->longitude;
                    }

                    $destLat = $destCoords[0];
                    $destLng = $destCoords[1];

                    // Cek jarak ke tujuan
                    $distance = sqrt(pow($destLat - $currentLat, 2) + pow($destLng - $currentLng, 2));

                    if ($distance < 0.005) {
                        // Sudah sampai tujuan
                        $trip->update(['status' => 'completed']);
                        $this->info("Trip #{$trip->id} ({$trip->schedule->origin} -> {$trip->schedule->destination}) telah TIBA di tujuan!");
                        continue;
                    }

                    // Hitung langkah (bergerak 8% lebih dekat ke tujuan tiap detik/tick)
                    $nextLat = $currentLat + ($destLat - $currentLat) * 0.08;
                    $nextLng = $currentLng + ($destLng - $currentLng) * 0.08;

                    // Simpan lokasi baru
                    Location::create([
                        'trip_id' => $trip->id,
                        'latitude' => $nextLat,
                        'longitude' => $nextLng,
                    ]);

                    $this->info("Trip #{$trip->id} [{$trip->schedule->origin} -> {$trip->schedule->destination}]: Update lokasi ({$nextLat}, {$nextLng})");
                }
            }

            sleep($interval);
        }
    }
}
