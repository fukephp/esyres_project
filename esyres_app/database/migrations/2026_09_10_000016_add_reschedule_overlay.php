<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salons', function (Blueprint $table): void {
            $table->unsignedInteger('reschedule_cap')->default(1);
        });
        Schema::table('bookings', function (Blueprint $table): void {
            $table->date('reschedule_date')->nullable();
            $table->dateTime('reschedule_starts_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropColumn(['reschedule_date', 'reschedule_starts_at']);
        });
        Schema::table('salons', function (Blueprint $table): void {
            $table->dropColumn('reschedule_cap');
        });
    }
};
