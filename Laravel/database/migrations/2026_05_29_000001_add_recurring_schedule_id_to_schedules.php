<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Add optional column to track which recurring schedule generated this
            $table->unsignedBigInteger('recurring_schedule_id')->nullable()->after('driver_id');
            $table->foreign('recurring_schedule_id')->references('id')->on('recurring_schedules')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeignIdFor(
                model: 'recurring_schedules',
                column: 'recurring_schedule_id'
            );
            $table->dropColumn('recurring_schedule_id');
        });
    }
};
