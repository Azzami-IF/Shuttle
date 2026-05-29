<?php

namespace App\Console\Commands;

use App\Services\RecurringScheduleService;
use Illuminate\Console\Command;

class GenerateRecurringSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedules:generate-recurring {--days=7 : Number of days ahead to generate schedules}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate schedules from recurring schedule rules';

    /**
     * Execute the console command.
     */
    public function handle(RecurringScheduleService $service): int
    {
        $this->info('Starting recurring schedule generation...');

        $daysAhead = $this->option('days');
        $result = $service->generateSchedules();

        $this->info("Generated {$result['generated']} schedules");

        if (!empty($result['errors'])) {
            $this->error('Errors occurred:');
            foreach ($result['errors'] as $error) {
                $this->error("  - Recurring ID {$error['recurring_id']}: {$error['error']}");
            }
            return 1;
        }

        $this->info('Recurring schedule generation completed successfully!');
        return 0;
    }
}
