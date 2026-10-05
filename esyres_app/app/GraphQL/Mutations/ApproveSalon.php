<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\AdminAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ApproveSalon
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        AdminAccess::user($context);
        $salon = Salon::query()->whereKey($args['id'])->whereNull('owner_id')->first();
        if (! $salon instanceof Salon || $salon->submitted_by === null) {
            throw new ClientError('NOT_FOUND');
        }

        $salon->owner_id = $salon->submitted_by;
        $salon->save();

        return $salon;
    }
}
