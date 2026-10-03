<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\Models\SalonRating;
use App\Models\User;
use Illuminate\Support\Collection;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class MyRatings
{
    /**
     * @return Collection<int, SalonRating>
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Collection
    {
        $user = $context->user();
        if (! $user instanceof User) {
            throw new ClientError('UNAUTHENTICATED');
        }

        return SalonRating::query()
            ->with('salon')
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();
    }
}
