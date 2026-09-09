<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assistant_intakes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('token')->unique();
            $table->json('service_ids');
            $table->foreignId('worker_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('worker_confirmed')->default(false);
            $table->string('preferred_date', 10)->nullable();
            $table->string('preferred_time', 5)->nullable();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistant_intakes');
    }
};
