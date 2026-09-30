<?php

namespace App\Models;

use App\Casts\UtcDatetime;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['salon_id', 'customer_id', 'worker_id', 'preferred_date', 'preferred_starts_at', 'status', 'duration_minutes', 'owner_responded_at', 'proposed_starts_at', 'proposed_worker_id', 'decline_reason', 'reschedule_date', 'reschedule_starts_at', 'cancelled_at', 'late_cancel', 'reminder_day_sent_at', 'reminder_hour_sent_at', 'origin', 'caller_name', 'caller_phone', 'caller_note'])]
class Booking extends Model
{
    public const REQUESTED = 'requested';

    public const CONFIRMED = 'confirmed';

    public const TIME_PROPOSED = 'time_proposed';

    public const DECLINED = 'declined';

    public const CANCELLED = 'cancelled';

    public const ORIGIN_PICKER = 'picker';

    public const ORIGIN_ASSISTANT = 'assistant';

    public const ORIGIN_PHONE = 'phone';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'preferred_starts_at' => UtcDatetime::class,
            'duration_minutes' => 'integer',
            'owner_responded_at' => 'datetime',
            'proposed_starts_at' => UtcDatetime::class,
            'reschedule_date' => 'date',
            'reschedule_starts_at' => UtcDatetime::class,
            'cancelled_at' => 'datetime',
            'late_cancel' => 'boolean',
            'no_show_at' => 'datetime',
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

    public function graphqlOrigin(): string
    {
        return strtoupper((string) $this->origin);
    }

    public function preferredDateString(): string
    {
        return $this->preferred_date->format('Y-m-d');
    }

    public function preferredStartsAtIso(): string
    {
        return $this->preferred_starts_at->utc()->toIso8601String();
    }

    public function preferredStartsAtLabel(): string
    {
        return $this->preferred_starts_at->timezone('Europe/Sarajevo')->format('H:i');
    }

    public function proposedStartsAtIso(): ?string
    {
        if ($this->status !== self::TIME_PROPOSED || $this->proposed_starts_at === null) {
            return null;
        }

        return $this->proposed_starts_at->utc()->toIso8601String();
    }

    public function proposedStartsAtLabel(): ?string
    {
        if ($this->status !== self::TIME_PROPOSED || $this->proposed_starts_at === null) {
            return null;
        }

        return $this->proposed_starts_at->timezone('Europe/Sarajevo')->format('H:i');
    }

    public function proposedDateString(): ?string
    {
        if ($this->status !== self::TIME_PROPOSED || $this->proposed_starts_at === null) {
            return null;
        }

        return $this->proposed_starts_at->timezone('Europe/Sarajevo')->format('Y-m-d');
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
        if ($this->origin === self::ORIGIN_PHONE) {
            return (string) $this->caller_name;
        }

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

    public function rescheduleStartsAtLabel(): ?string
    {
        if ($this->reschedule_starts_at === null) {
            return null;
        }

        return $this->reschedule_starts_at->timezone('Europe/Sarajevo')->format('H:i');
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
