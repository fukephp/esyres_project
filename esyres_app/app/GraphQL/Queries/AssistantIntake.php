<?php

namespace App\GraphQL\Queries;

use App\Models\AssistantIntake as AssistantIntakeModel;
use Illuminate\Support\Str;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class AssistantIntake
{
    /**
     * @param  array{token: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): ?AssistantIntakeModel
    {
        $token = $args['token'];
        if ($token === '' || ! Str::isUuid($token)) {
            return null;
        }
        $row = AssistantIntakeModel::query()->with('customer')->where('token', $token)->first();
        if ($row === null || ! $row->isInFlight()) {
            return null;
        }

        return $row->load('salon');
    }
}
