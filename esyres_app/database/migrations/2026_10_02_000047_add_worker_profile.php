<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->string('photo_path')->nullable();
            $table->text('about')->nullable();
            $table->unsignedTinyInteger('experience_years')->nullable();
            $table->string('portfolio_url', 2048)->nullable();
            $table->string('maintenance', 300)->nullable();
            $table->json('talents')->nullable();
            $table->json('specializations')->nullable();
            $table->json('certificates')->nullable();
            $table->json('education')->nullable();
            $table->json('brands')->nullable();
        });

        Schema::create('worker_strongest_services', function (Blueprint $table) {
            $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->primary(['worker_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worker_strongest_services');
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn([
                'photo_path',
                'about',
                'experience_years',
                'portfolio_url',
                'maintenance',
                'talents',
                'specializations',
                'certificates',
                'education',
                'brands',
            ]);
        });
    }
};
