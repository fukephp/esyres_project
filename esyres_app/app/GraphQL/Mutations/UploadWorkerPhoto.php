<?php

namespace App\GraphQL\Mutations;

use App\GraphQL\OwnerAccess;
use App\Models\Worker;
use App\SalonMedia\SalonImages;
use Illuminate\Http\UploadedFile;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UploadWorkerPhoto
{
    /**
     * @param  array{workerId: string, file: UploadedFile}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): Worker
    {
        $worker = OwnerAccess::worker(OwnerAccess::user($context), $args['workerId']);
        SalonImages::storeWorkerPhoto($worker, $args['file']);

        return $worker->fresh() ?? $worker;
    }
}
