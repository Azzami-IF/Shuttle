<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Generate recurring schedules every hour
        $schedule->command('schedules:generate-recurring', ['--days=14'])
            ->hourly()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/recurring-schedules.log'));

        // Cleanup expired payments every 2 minutes
        $schedule->command('payments:cleanup-expired')
            ->everyTwoMinutes()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/expired-payments.log'));

        // Alternatively, run more frequently for shorter intervals:
        // $schedule->command('schedules:generate-recurring', ['--days=3'])
        //     ->everyThirtyMinutes()
        //     ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
