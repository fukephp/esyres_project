<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class CreateSalon
{
    /**
     * @param  array{name: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $user = OwnerAccess::user($context);
        if ($user->is_admin) {
            throw new ClientError('FORBIDDEN');
        }
        $name = trim($args['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }
        if ($user->salons()->exists()) {
            throw new ClientError('ALREADY_OWNER');
        }
        if (Salon::query()->where('submitted_by', $user->id)->whereNull('owner_id')->exists()) {
            throw new ClientError('PENDING_SALON');
        }
        if (Booking::query()->where('customer_id', $user->id)->exists()) {
            throw new ClientError('HAS_BOOKINGS');
        }

        $user->salon_rejected = false;
        $user->save();

        return Salon::query()->create([
            'owner_id' => null,
            'submitted_by' => $user->id,
            'name' => $name,
        ]);
    }
}
