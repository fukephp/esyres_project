<?php

namespace App\Models;

use Database\Factories\AssistantIntakeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable(['salon_id', 'customer_id', 'token', 'service_ids', 'worker_id', 'worker_confirmed', 'preferred_date', 'preferred_time', 'booking_id'])]
class AssistantIntake extends Model
{
    /** @use HasFactory<AssistantIntakeFactory> */
    use HasFactory;

    public const STALE_HOURS = 24;

    public const GUEST_NAME = 'Gost';

    protected static function newFactory(): AssistantIntakeFactory
    {
        return AssistantIntakeFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'service_ids' => 'array',
            'worker_confirmed' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeInFlight(Builder $query): Builder
    {
        return $query
            ->whereNull('booking_id')
            ->where('updated_at', '>=', now()->subHours(self::STALE_HOURS));
    }

    public function isInFlight(?Carbon $now = null): bool
    {
        if ($this->booking_id !== null) {
            return false;
        }
        $at = $this->updated_at;
        if ($at === null) {
            return false;
        }

        return $at->gte(($now ?? now())->copy()->subHours(self::STALE_HOURS));
    }

    public function customerName(): string
    {
        $name = $this->customer?->name;
        if ($name === null || $name === '') {
            return self::GUEST_NAME;
        }

        return $name;
    }

    public function updatedAtIso(): string
    {
        return $this->updated_at->toIso8601String();
    }

    /** @return list<string> */
    public function serviceIdList(): array
    {
        $ids = $this->service_ids ?? [];
        $out = [];
        foreach ($ids as $id) {
            $out[] = (string) $id;
        }

        return $out;
    }

    public function workerIdString(): ?string
    {
        return $this->worker_id === null ? null : (string) $this->worker_id;
    }
}
