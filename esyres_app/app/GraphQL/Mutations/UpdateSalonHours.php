<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\Salon;
use App\Models\User;
use App\SalonHours\WeeklyHours;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalonHours
{
    /**
     * @param  array{salonId: string, input: array{hours: list<array<string, mixed>>, cancellationNoticeHours: int}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }
        if ($user->email_verified_at === null) {
            throw new ClientError('EMAIL_UNVERIFIED');
        }

        $salon = Salon::query()->find($args['salonId']);
        if ($salon === null || $salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        $notice = $args['input']['cancellationNoticeHours'];
        if (! is_int($notice) || $notice < 0 || $notice > 8760) {
            throw new ClientError('INVALID_HOURS');
        }

        $salon->hours = WeeklyHours::fromInput($args['input']['hours']);
        $salon->cancellation_notice_hours = $notice;
        $salon->save();

        return $salon;
    }
}
