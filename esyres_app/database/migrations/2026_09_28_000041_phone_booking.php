<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        DB::statement('ALTER TABLE bookings MODIFY customer_id BIGINT UNSIGNED NULL');

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('origin', 16)->default('picker');
            $table->string('caller_name')->nullable();
            $table->string('caller_phone')->nullable();
            $table->text('caller_note')->nullable();
        });

        DB::update('update bookings inner join assistant_intakes on assistant_intakes.booking_id = bookings.id set bookings.origin = ?', ['assistant']);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['origin', 'caller_name', 'caller_phone', 'caller_note']);
        });

        DB::statement('ALTER TABLE bookings MODIFY customer_id BIGINT UNSIGNED NOT NULL');

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
