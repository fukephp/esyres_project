<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salons', function (Blueprint $table) {
            $table->string('description', 1000)->nullable();
            $table->string('main_image_path')->nullable();
            $table->json('gallery_paths')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('salons', function (Blueprint $table) {
            $table->dropColumn(['description', 'main_image_path', 'gallery_paths']);
        });
    }
};
