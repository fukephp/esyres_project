<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\CustomerAccess;
use App\Models\RatingReply;
use App\Models\SalonRating;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ReplyToRating
{
    /**
     * @param  array{ratingId: string, body: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): SalonRating
    {
        $user = CustomerAccess::verified($context);
        $rating = SalonRating::query()->with('salon')->find($args['ratingId']);
        if (! $rating instanceof SalonRating) {
            throw new ClientError('NOT_FOUND');
        }
        if (trim((string) $rating->comment) === '') {
            throw new ClientError('EMPTY_COMMENT');
        }
        if ((int) $rating->user_id === (int) $user->id) {
            throw new ClientError('FORBIDDEN');
        }
        if ($user->salons()->whereKey($rating->salon_id)->exists()) {
            throw new ClientError('FORBIDDEN');
        }

        $body = trim($args['body']);
        if ($body === '' || mb_strlen($body) > 500) {
            throw new ClientError('COMMENT_TOO_LONG');
        }

        RatingReply::query()->updateOrCreate(
            ['salon_rating_id' => $rating->id, 'user_id' => $user->id],
            ['body' => $body],
        );

        return $rating;
    }
}
