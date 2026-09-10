<?php

use App\Models\QrHit;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_hits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salon_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->index(['salon_id', 'created_at']);
        });

        QrHit::backfillFromVisits();
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_hits');
    }
};
