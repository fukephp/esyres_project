<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\AdminAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RejectSalon
{
    /**
     * @param  array{id: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        AdminAccess::user($context);
        $salon = Salon::query()->whereKey($args['id'])->whereNull('owner_id')->first();
        if (! $salon instanceof Salon) {
            throw new ClientError('NOT_FOUND');
        }

        $submitter = $salon->submitter;
        $salon->delete();
        if ($submitter !== null) {
            $submitter->salon_rejected = true;
            $submitter->save();
        }

        return true;
    }
}
