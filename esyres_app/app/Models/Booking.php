<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['salon_id', 'customer_id', 'worker_id', 'preferred_date', 'preferred_starts_at', 'status', 'duration_minutes', 'owner_responded_at', 'proposed_starts_at', 'proposed_worker_id', 'decline_reason'])]
class Booking extends Model
{
    public const REQUESTED = 'requested';

    public const CONFIRMED = 'confirmed';

    public const TIME_PROPOSED = 'time_proposed';

    public const DECLINED = 'declined';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'preferred_starts_at' => 'datetime',
            'duration_minutes' => 'integer',
            'owner_responded_at' => 'datetime',
            'proposed_starts_at' => 'datetime',
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
     * @return BelongsTo<Worker, $this>
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * @return BelongsTo<Worker, $this>
     */
    public function proposedWorker(): BelongsTo
    {
        return $this->belongsTo(Worker::class, 'proposed_worker_id');
    }

    /**
     * @return HasMany<BookingService, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(BookingService::class)->orderBy('id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, BookingService>
     */
    public function snapshotList()
    {
        return $this->services()->get();
    }

    public function graphqlStatus(): string
    {
        return strtoupper($this->status);
    }

    public function preferredDateString(): string
    {
        return $this->preferred_date->format('Y-m-d');
    }

    public function preferredStartsAtIso(): string
    {
        return $this->preferred_starts_at->utc()->toIso8601String();
    }

    public function proposedStartsAtIso(): ?string
    {
        if ($this->status !== self::TIME_PROPOSED || $this->proposed_starts_at === null) {
            return null;
        }

        return $this->proposed_starts_at->utc()->toIso8601String();
    }

    public function proposedWorkerOrNull(): ?Worker
    {
        if ($this->status !== self::TIME_PROPOSED) {
            return null;
        }

        return $this->proposedWorker;
    }

    public function customerName(): string
    {
        return $this->customer->name;
    }

    public static function roundUp15(int $minutes): int
    {
        return intdiv($minutes + 14, 15) * 15;
    }
}
