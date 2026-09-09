<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\AssistantIntake;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Support\Str;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class UpsertAssistantIntake
{
    /**
     * @param  array{input: array{salonId: string, token?: string|null, serviceIds: list<string|int>, workerId?: string|null, workerConfirmed: bool, preferredDate?: string|null, preferredTime?: string|null}}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): AssistantIntake
    {
        $input = $args['input'];
        $salon = Salon::query()->find($input['salonId']);
        if ($salon === null) {
            throw new ClientError('INVALID_SALON');
        }

        $token = isset($input['token']) && is_string($input['token']) ? $input['token'] : '';
        $row = $this->existing($salon->id, $token);
        if ($row === null) {
            $row = new AssistantIntake;
            $row->salon_id = $salon->id;
            $row->token = (string) Str::uuid();
        }

        $user = $context->user();
        if ($user instanceof User) {
            $row->customer_id = $user->id;
        }

        $row->service_ids = $this->serviceIds($salon, $input['serviceIds']);
        $row->worker_id = $this->workerId($salon, $input['workerId'] ?? null);
        $row->worker_confirmed = (bool) $input['workerConfirmed'];
        $row->preferred_date = $this->nullableString($input['preferredDate'] ?? null);
        $row->preferred_time = $this->nullableString($input['preferredTime'] ?? null);
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

        return $row;
    }

    /**
     * @param  list<string|int>  $ids
     * @return list<string>
     */
    private function serviceIds(Salon $salon, array $ids): array
    {
        $wanted = [];
        foreach ($ids as $id) {
            $key = (string) $id;
            if ($key !== '' && ! in_array($key, $wanted, true)) {
                $wanted[] = $key;
            }
        }
        if ($wanted === []) {
            return [];
        }
        $found = Service::query()
            ->where('salon_id', $salon->id)
            ->whereIn('id', $wanted)
            ->pluck('id')
            ->map(fn (mixed $id): string => (string) $id)
            ->all();

        return array_values(array_filter($wanted, fn (string $id): bool => in_array($id, $found, true)));
    }

    private function workerId(Salon $salon, mixed $workerId): ?int
    {
        if ($workerId === null || $workerId === '') {
            return null;
        }
        $worker = Worker::query()->find($workerId);
        if ($worker === null || $worker->salon_id !== $salon->id) {
            return null;
        }

        return $worker->id;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
