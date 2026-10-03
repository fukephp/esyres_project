<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\CustomerAccess;
use App\Models\Salon;
use App\Models\SalonRating;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RateSalon
{
    /**
     * @param  array{salonId: string, score: int, comment?: string|null}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $user = CustomerAccess::verified($context);
        $salon = Salon::query()->find($args['salonId']);
        if (! $salon instanceof Salon) {
            throw new ClientError('NOT_FOUND');
        }
        if ($user->salons()->whereKey($salon->id)->exists()) {
            throw new ClientError('FORBIDDEN');
        }

        $score = (int) $args['score'];
        if ($score < 1 || $score > 5) {
            throw new ClientError('INVALID_SCORE');
        }

        $comment = isset($args['comment']) ? trim($args['comment']) : '';
        if (mb_strlen($comment) > 500) {
            throw new ClientError('COMMENT_TOO_LONG');
        }

        SalonRating::query()->updateOrCreate(
            ['user_id' => $user->id, 'salon_id' => $salon->id],
            ['score' => $score, 'comment' => $comment === '' ? null : $comment],
        );

        return $salon->refresh();
    }
}
