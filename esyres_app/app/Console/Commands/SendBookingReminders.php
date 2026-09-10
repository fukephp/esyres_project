<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\BookingReminder;
use Illuminate\Console\Command;

final class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';

    protected $description = 'Send day-before and hour-before reminder emails for confirmed bookings';

    public function handle(): int
    {
        $now = now();
        $bookings = Booking::query()
            ->where('status', Booking::CONFIRMED)
            ->with(['customer', 'salon'])
            ->get();

        foreach ($bookings as $booking) {
            $customer = $booking->customer;
            if ($customer->email_verified_at === null) {
                continue;
            }
            $start = $booking->preferred_starts_at;
            if ($now->gte($start)) {
                continue;
            }

            $dirty = false;
            $nowSarajevo = $now->copy()->timezone('Europe/Sarajevo');
            $startSarajevo = $start->copy()->timezone('Europe/Sarajevo');
            $dayBefore = $startSarajevo->copy()->subDay()->toDateString();
            $nine = $nowSarajevo->copy()->startOfDay()->setTime(9, 0, 0);

            if ($booking->reminder_day_sent_at === null
                && $nowSarajevo->toDateString() === $dayBefore
                && $nowSarajevo->gte($nine)) {
                $customer->notify(new BookingReminder($booking, 'day'));
                $booking->reminder_day_sent_at = $now;
                $dirty = true;
            }

            if ($booking->reminder_hour_sent_at === null
                && $now->gte($start->copy()->subHour())
                && $now->lt($start)) {
                $customer->notify(new BookingReminder($booking, 'hour'));
                $booking->reminder_hour_sent_at = $now;
                $dirty = true;
            }

            if ($dirty) {
                $booking->save();
            }
        }

        return self::SUCCESS;
    }
}
