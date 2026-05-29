<?php

namespace App\Console\Commands;

use App\Services\PaymentWebhookService;
use Illuminate\Console\Command;

class CleanupExpiredPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:cleanup-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup expired pending payments (older than 15 minutes)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Cleaning up expired payments...');

        $count = PaymentWebhookService::cleanupExpiredPayments();

        $this->info("Cleaned up $count expired payments.");

        return 0;
    }
}
