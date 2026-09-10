<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\AssistantIntake;
use App\Models\Salon;
use App\Models\User;
use Illuminate\Support\Str;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class PingAssistantIntake
{
    /**
     * @param  array{salonId: string, token?: string|null}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): AssistantIntake
    {
        $salon = Salon::query()->find($args['salonId']);
        if ($salon === null) {
            throw new ClientError('INVALID_SALON');
        }

        $token = isset($args['token']) && is_string($args['token']) ? $args['token'] : '';
        $row = $this->existing($salon->id, $token);
        if ($row !== null && $row->takenOver()) {
            throw new ClientError('INTAKE_TAKEN_OVER');
        }
        if ($row === null) {
            $row = new AssistantIntake;
            $row->salon_id = $salon->id;
            $row->token = (string) Str::uuid();
            $row->service_ids = [];
            $row->worker_confirmed = false;
        }

        $user = $context->user();
        if ($user instanceof User) {
            $row->customer_id = $user->id;
        }

        $row->pinged_at = $row->pinged_at ?? now();
        $row->updated_at = now();
        $row->save();

        return $row->load('customer');
    }

    private function existing(int $salonId, string $token): ?AssistantIntake
    {
        if ($token === '' || ! Str::isUuid($token)) {
            return null;
        }
        $row = AssistantIntake::query()
            ->where('salon_id', $salonId)
            ->where('token', $token)
            ->first();
        if ($row === null || ! $row->isInFlight()) {
            return null;
        }

        return $row->load('salon');
    }
};
