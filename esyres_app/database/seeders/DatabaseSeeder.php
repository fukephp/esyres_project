<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (! app()->environment('local')) {
            throw new RuntimeException('Database seeding is allowed only when APP_ENV=local.');
        }

        $this->call(LocalDemoSeeder::class);
    }
}
