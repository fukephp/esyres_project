<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use App\SalonMedia\SalonImages;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class RemoveSalonMainImage
{
    /**
     * @param  array{salonId: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        SalonImages::removeMain($salon);

        return $salon->fresh() ?? $salon;
    }
}
