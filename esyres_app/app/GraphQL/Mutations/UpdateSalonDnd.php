<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpdateSalonDnd
{
    /**
     * @param  array{salonId: string, dnd: bool}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        $salon->dnd = $args['dnd'];
        $salon->save();

        return $salon;
    }
};
