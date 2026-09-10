<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salons', function (Blueprint $table) {
            $table->boolean('dnd')->default(false);
        });
        Schema::table('assistant_intakes', function (Blueprint $table) {
            $table->timestamp('taken_over_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('assistant_intakes', function (Blueprint $table) {
            $table->dropColumn('taken_over_at');
        });
        Schema::table('salons', function (Blueprint $table) {
            $table->dropColumn('dnd');
        });
    }
};
