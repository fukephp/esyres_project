<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['salon_id', 'customer_id', 'worker_id', 'preferred_date', 'preferred_starts_at', 'status', 'duration_minutes'])]
class Booking extends Model
{
    public const REQUESTED = 'requested';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'preferred_starts_at' => 'datetime',
            'duration_minutes' => 'integer',
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

    public function customerName(): string
    {
        return $this->customer->name;
    }

    public static function roundUp15(int $minutes): int
    {
        return intdiv($minutes + 14, 15) * 15;
    }
}
