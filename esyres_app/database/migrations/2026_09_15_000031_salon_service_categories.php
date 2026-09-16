<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salon_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('legacy_key')->nullable();
            $table->timestamps();
            $table->unique(['salon_id', 'name']);
            $table->unique(['salon_id', 'legacy_key']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('service_category_id')->nullable()->after('salon_id')->constrained('service_categories')->restrictOnDelete();
        });

        $names = [
            'HAIR' => 'Kosa',
            'MAKE_UP' => 'Šminka',
            'MASSAGE' => 'Masaža',
        ];
        $cache = [];
        foreach (DB::table('services')->orderBy('id')->get() as $service) {
            $key = (string) $service->category;
            $cacheKey = $service->salon_id.'|'.$key;
            if (! isset($cache[$cacheKey])) {
                $cache[$cacheKey] = DB::table('service_categories')->insertGetId([
                    'salon_id' => $service->salon_id,
                    'name' => $names[$key] ?? $key,
                    'legacy_key' => isset($names[$key]) ? $key : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            DB::table('services')->where('id', $service->id)->update([
                'service_category_id' => $cache[$cacheKey],
            ]);
        }

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('category');
        });

        DB::statement('ALTER TABLE services MODIFY service_category_id BIGINT UNSIGNED NOT NULL');
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('category')->nullable();
        });

        foreach (DB::table('services')->orderBy('id')->get() as $service) {
            $category = DB::table('service_categories')->where('id', $service->service_category_id)->first();
            DB::table('services')->where('id', $service->id)->update([
                'category' => $category->legacy_key ?? $category->name ?? 'HAIR',
            ]);
        }

        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['service_category_id']);
            $table->dropColumn('service_category_id');
        });
        Schema::dropIfExists('service_categories');
    }
};
