<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use App\SalonHours\WeeklyHours;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class LocalDemoSeeder extends Seeder
{
    public function run(): void
    {
        $owner = $this->user('Amira Hodžić', 'owner@esyres.test');
        $guest = $this->user('Ana Kovač', 'guest@esyres.test');
        $owner2 = $this->user('Emir Begić', 'owner2@esyres.test');

        $primary = $this->salon($owner, 'Salon Mira', 43.8590, 18.4310);
        $second = $this->salon($owner, 'Studio Luna', 43.8566, 18.3970);
        $spa = $this->salon($owner2, 'Spa Ilidža', 43.8290, 18.3090);

        $cut = $this->service($primary, 'Šišanje', 'HAIR', 30, 2500);
        $this->service($second, 'Šminka', 'MAKE_UP', 45, 4000);
        $this->service($spa, 'Masaža leđa', 'MASSAGE', 60, 5000);

        $lejla = $this->worker($primary, 'Lejla');
        $this->worker($second, 'Maja');
        $this->worker($spa, 'Tarik');

        $tz = 'Europe/Sarajevo';
        $this->booking($primary, $guest, $cut, now($tz)->addDay()->setTime(10, 0), Booking::REQUESTED);
        $this->booking($primary, $guest, $cut, now($tz)->addDay()->setTime(14, 0), Booking::REQUESTED);
        $this->booking($primary, $guest, $cut, now($tz)->addDays(2)->setTime(11, 0), Booking::TIME_PROPOSED, $lejla);
        $this->booking($primary, $guest, $cut, now($tz)->addDays(3)->setTime(12, 0), Booking::CONFIRMED, $lejla);
    }

    private function user(string $name, string $email): User
    {
        $user = new User;
        $user->name = $name;
        $user->email = $email;
        $user->password = 'password';
        $user->email_verified_at = now();
        $user->save();

        return $user;
    }

    private function salon(User $owner, string $name, float $lat, float $lng): Salon
    {
        $salon = new Salon;
        $salon->owner_id = $owner->id;
        $salon->name = $name;
        $salon->lat = $lat;
        $salon->lng = $lng;
        $salon->hours = $this->openWeek();
        $salon->save();

        return $salon;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function openWeek(): array
    {
        $open = [
            'closed' => false,
            'opens_at' => '09:00',
            'closes_at' => '17:00',
            'break_starts_at' => '13:00',
            'break_ends_at' => '14:00',
        ];
        $week = [];
        foreach (WeeklyHours::WEEKDAYS as $day) {
            $week[$day] = $day === 'sunday' ? ['closed' => true] : $open;
        }

        return $week;
    }

    private function service(Salon $salon, string $name, string $category, int $minutes, int $feninga): Service
    {
        $service = new Service;
        $service->salon_id = $salon->id;
        $service->name = $name;
        $service->category = $category;
        $service->duration_minutes = $minutes;
        $service->price_feninga = $feninga;
        $service->save();

        return $service;
    }

    private function worker(Salon $salon, string $name): Worker
    {
        $worker = new Worker;
        $worker->salon_id = $salon->id;
        $worker->name = $name;
        $worker->save();

        return $worker;
    }

    private function booking(Salon $salon, User $guest, Service $service, Carbon $starts, string $status, ?Worker $worker = null): void
    {
        $booking = new Booking;
        $booking->salon_id = $salon->id;
        $booking->customer_id = $guest->id;
        $booking->preferred_date = $starts->toDateString();
        $booking->preferred_starts_at = $starts;
        $booking->status = $status;
        $booking->duration_minutes = $service->duration_minutes;
        if ($status === Booking::CONFIRMED) {
            $booking->worker_id = $worker?->id;
            $booking->owner_responded_at = now();
        }
        if ($status === Booking::TIME_PROPOSED) {
            $booking->proposed_starts_at = $starts;
            $booking->proposed_worker_id = $worker?->id;
            $booking->owner_responded_at = now();
        }
        $booking->save();

        $row = new BookingService;
        $row->booking_id = $booking->id;
        $row->name = $service->name;
        $row->duration_minutes = $service->duration_minutes;
        $row->price_feninga = $service->price_feninga;
        $row->save();
    }
}
