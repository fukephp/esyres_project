<?php

namespace Database\Factories;

use App\Models\Salon;
use App\Models\SalonServiceCategory;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'salon_id' => Salon::factory(),
            'name' => fake()->unique()->words(2, true),
            'duration_minutes' => 30,
            'price_feninga' => 2500,
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Service $service): void {
            if ($service->service_category_id) {
                return;
            }
            if ($service->salon_id === null) {
                return;
            }
            $category = SalonServiceCategory::firstOrCreateLegacy((int) $service->salon_id, 'HAIR');
            $service->service_category_id = $category->id;
        });
    }
}
