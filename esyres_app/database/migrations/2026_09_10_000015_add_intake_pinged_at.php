<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assistant_intakes', function (Blueprint $table) {
            $table->timestamp('pinged_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('assistant_intakes', function (Blueprint $table) {
            $table->dropColumn('pinged_at');
        });
    }
};
