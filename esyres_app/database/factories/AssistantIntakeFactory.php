<?php

namespace Database\Factories;

use App\Models\AssistantIntake;
use App\Models\Salon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AssistantIntake>
 */
class AssistantIntakeFactory extends Factory
{
    protected $model = AssistantIntake::class;
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'salon_id' => Salon::factory(),
            'customer_id' => null,
            'token' => (string) Str::uuid(),
            'service_ids' => [],
            'worker_id' => null,
            'worker_confirmed' => false,
            'preferred_date' => null,
            'preferred_time' => null,
            'booking_id' => null,
        ];
    }
}
