<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['salon_id', 'customer_id', 'worker_id', 'preferred_date', 'preferred_starts_at', 'status', 'duration_minutes', 'owner_responded_at', 'proposed_starts_at', 'proposed_worker_id', 'decline_reason', 'reschedule_date', 'reschedule_starts_at', 'cancelled_at', 'late_cancel', 'reminder_day_sent_at', 'reminder_hour_sent_at'])]
class Booking extends Model
{
    public const REQUESTED = 'requested';

    public const CONFIRMED = 'confirmed';

    public const TIME_PROPOSED = 'time_proposed';

    public const DECLINED = 'declined';

    public const CANCELLED = 'cancelled';

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
            'reschedule_date' => 'date',
            'reschedule_starts_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'late_cancel' => 'boolean',
            'reminder_day_sent_at' => 'datetime',
            'reminder_hour_sent_at' => 'datetime',
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
     * @return HasOne<AssistantIntake, $this>
     */
    public function intake(): HasOne
    {
        return $this->hasOne(AssistantIntake::class);
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

    public function rescheduleDateString(): ?string
    {
        if ($this->reschedule_starts_at === null || $this->reschedule_date === null) {
            return null;
        }

        return $this->reschedule_date->format('Y-m-d');
    }

    public function rescheduleStartsAtIso(): ?string
    {
        if ($this->reschedule_starts_at === null) {
            return null;
        }

        return $this->reschedule_starts_at->utc()->toIso8601String();
    }

    public function reschedulePending(): bool
    {
        return $this->reschedule_starts_at !== null;
    }

    public function lateToCancel(): bool
    {
        if ($this->status !== self::CONFIRMED) {
            return false;
        }
        $start = $this->preferred_starts_at;
        $now = now();
        if ($now->gte($start)) {
            return false;
        }

        return $now->gte($start->copy()->subHours((int) $this->salon->cancellation_notice_hours));
    }

    public function cancelledAtIso(): ?string
    {
        if ($this->cancelled_at === null) {
            return null;
        }

        return $this->cancelled_at->utc()->toIso8601String();
    }

    public function lateCancel(): bool
    {
        return $this->late_cancel === true;
    }

    public static function roundUp15(int $minutes): int
    {
        return intdiv($minutes + 14, 15) * 15;
    }
}
