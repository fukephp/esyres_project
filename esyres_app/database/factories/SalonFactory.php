<?php

namespace Database\Factories;

use App\Models\Salon;
use App\Models\User;
use App\SalonHours\WeeklyHours;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Salon>
 */
class SalonFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => fake()->company(),
            'cancellation_notice_hours' => 24,
            'hours' => WeeklyHours::closedWeek(),
            'lat' => null,
            'lng' => null,
        ];
    }
}
