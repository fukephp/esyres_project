<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Salon;
use App\SalonMedia\SalonImages;
use Illuminate\Http\UploadedFile;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UploadSalonMainImage
{
    /**
     * @param  array{salonId: string, file: UploadedFile}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Salon
    {
        $salon = OwnerAccess::salon(OwnerAccess::user($context), $args['salonId']);
        SalonImages::storeMain($salon, $args['file']);

        return $salon->fresh() ?? $salon;
    }
}
