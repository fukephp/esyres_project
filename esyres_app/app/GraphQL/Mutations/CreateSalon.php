<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
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
        $name = trim($args['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }

        return Salon::query()->create([
            'owner_id' => $user->id,
            'name' => $name,
        ]);
    }
}
