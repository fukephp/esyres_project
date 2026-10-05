<?php

namespace App\GraphQL\Queries;

use App\Booking\Unanswered;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PendingJump
{
    /**
     * @param  array{salonId: string}  $args
     * @return array{count: int, dates: list<string>}
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): array
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);

        $rows = Booking::query()
            ->where('salon_id', $salon->id)
            ->where(function ($query): void {
                $query->where('status', Booking::REQUESTED)
                    ->orWhere(function ($query): void {
                        $query->where('status', Booking::CONFIRMED)
                            ->whereNotNull('reschedule_starts_at');
                    });
            })
            ->get(['status', 'preferred_date', 'reschedule_date']);

        $today = Unanswered::today();
        $days = [];
        foreach ($rows as $row) {
            $day = $row->status === Booking::REQUESTED ? $row->preferred_date : $row->reschedule_date;
            if ($day === null) {
                continue;
            }
            $ymd = $day->format('Y-m-d');
            if ($row->status === Booking::REQUESTED && $ymd < $today) {
                continue;
            }
            $days[] = $ymd;
        }

        $dates = array_values(array_unique($days));
        sort($dates);

        return [
            'count' => count($days),
            'dates' => $dates,
        ];
    }
}
