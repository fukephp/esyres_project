<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('cancel_count')->default(0);
            $table->unsignedInteger('late_cancel_count')->default(0);
            $table->unsignedInteger('no_show_count')->default(0);
        });
        Schema::table('salons', function (Blueprint $table): void {
            $table->unsignedInteger('cancel_count')->default(0);
            $table->unsignedInteger('late_cancel_count')->default(0);
            $table->unsignedInteger('no_show_count')->default(0);
        });
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dateTime('no_show_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['cancel_count', 'late_cancel_count', 'no_show_count']);
        });
        Schema::table('salons', function (Blueprint $table): void {
            $table->dropColumn(['cancel_count', 'late_cancel_count', 'no_show_count']);
        });
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropColumn('no_show_at');
        });
    }
};
