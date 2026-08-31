<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('proposed_starts_at')->nullable();
            $table->foreignId('proposed_worker_id')->nullable()->constrained('workers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('proposed_worker_id');
            $table->dropColumn('proposed_starts_at');
        });
    }
};
