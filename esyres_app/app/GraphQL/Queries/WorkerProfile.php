<?php

namespace App\GraphQL\Queries;

use App\Exceptions\ClientError;
use App\GraphQL\OwnerAccess;
use App\Models\Worker;
use App\SalonMedia\SalonImages;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class WorkerProfile
{
    /**
     * @return array<string, mixed>
     */
    public function __invoke(Worker $worker, array $args, GraphQLContext $context): array
    {
        $user = OwnerAccess::user($context);
        if ($worker->salon->owner_id !== $user->id) {
            throw new ClientError('FORBIDDEN');
        }

        $profile = [
            'photoUrl' => SalonImages::publicUrl(is_string($worker->photo_path) ? $worker->photo_path : null),
            'about' => $worker->about,
            'experienceYears' => $worker->experience_years,
            'portfolioUrl' => $worker->portfolio_url,
            'maintenance' => $worker->maintenance,
            'strongestServiceIds' => $worker->strongestServices()->orderBy('services.id')->pluck('services.id')->map(fn ($id) => (string) $id)->all(),
        ];
        foreach (Worker::LIST_FIELDS as $field) {
            $rows = $worker->{$field};
            $profile[$field] = is_array($rows) ? array_values($rows) : [];
        }

        return $profile;
    }
}
