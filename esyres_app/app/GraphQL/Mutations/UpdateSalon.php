<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalon
{
    /**
     * @param  array{salonId: string, input: array{name: string, address: string, description?: string|null}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $name = trim($args['input']['name']);
        $address = trim($args['input']['address']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }
        if ($address === '') {
            throw new ClientError('INVALID_ADDRESS');
        }

        $description = null;
        $hasDescription = array_key_exists('description', $args['input']);
        if ($hasDescription) {
            $description = trim((string) ($args['input']['description'] ?? ''));
            if (mb_strlen($description) > 1000) {
                throw new ClientError('DESCRIPTION_TOO_LONG');
            }
        }

        $salon->name = $name;
        $salon->address = $address;
        if ($hasDescription) {
            $salon->description = $description === '' ? null : $description;
        }
        $salon->save();

        return $salon;
    }
}
