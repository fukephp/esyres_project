<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AddSalon
{
    /**
     * @param  array{name: string, address: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $user = OwnerAccess::user($context);
        if (! $user->salons()->exists()) {
            throw new ClientError('FORBIDDEN');
        }

        $name = trim($args['name']);
        $address = trim($args['address']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }
        if ($address === '') {
            throw new ClientError('INVALID_ADDRESS');
        }

        return Salon::query()->create([
            'owner_id' => $user->id,
            'name' => $name,
            'address' => $address,
        ]);
    }
}
