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
        Schema::create('recurring_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('driver_id');
            $table->string('origin');
            $table->string('destination');
            
            // Recurrence pattern: 'hourly', 'daily', 'weekly', 'custom'
            $table->enum('recurrence_pattern', ['hourly', 'daily', 'weekly', 'monthly', 'custom'])->default('daily');
            
            // For weekly pattern: comma-separated days (1-7 for Mon-Sun, or day names)
            $table->string('days_of_week')->nullable();
            
            // For custom intervals (e.g., every 2 hours, every 3 days)
            $table->unsignedInteger('interval')->default(1);
            $table->enum('interval_unit', ['hour', 'day', 'week', 'month'])->default('day');
            
            // Start time for the schedule (e.g., 08:00:00)
            $table->time('start_time');
            
            // Date range for this recurring pattern
            $table->date('start_date');
            $table->date('end_date')->nullable();
            
            // Maximum number of schedules to generate (optional limit)
            $table->unsignedInteger('max_occurrences')->nullable();
            
            // Status: active, paused, completed
            $table->enum('status', ['active', 'paused', 'completed'])->default('active');
            
            // Track when this recurrence was last processed
            $table->timestamp('last_generated_at')->nullable();
            
            // For tracking which schedules were created from this rule
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            
            // Foreign keys
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
            $table->foreign('driver_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_schedules');
    }
};
