<?php

namespace App\Console\Commands;

use App\Booking\Unanswered;
use App\Models\Booking;
use Illuminate\Console\Command;

final class ExpireUnansweredBookings extends Command
{
    protected $signature = 'bookings:expire-unanswered';

    protected $description = 'Decline requested bookings whose preferred day has ended';

    public function handle(): int
    {
        Booking::query()
            ->where('status', Booking::REQUESTED)
            ->whereDate('preferred_date', '<', Unanswered::today())
            ->update([
                'status' => Booking::DECLINED,
                'decline_reason' => 'expired',
            ]);

        return self::SUCCESS;
    }
}
