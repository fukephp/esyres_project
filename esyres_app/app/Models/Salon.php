<?php

namespace App\Models;

use App\SalonHours\OpenNow;
use App\SalonHours\WeeklyHours;
use Database\Factories\SalonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'name', 'address', 'cancellation_notice_hours', 'reschedule_cap', 'hours', 'lat', 'lng', 'dnd'])]
class Salon extends Model
{
    /** @use HasFactory<SalonFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Salon $salon): void {
            if ($salon->hours === null) {
                $salon->hours = WeeklyHours::closedWeek();
            }
            if ($salon->cancellation_notice_hours === null) {
                $salon->cancellation_notice_hours = 24;
            }
            if ($salon->dnd === null) {
                $salon->dnd = false;
            }
            if ($salon->reschedule_cap === null) {
                $salon->reschedule_cap = 1;
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hours' => 'array',
            'cancellation_notice_hours' => 'integer',
            'reschedule_cap' => 'integer',
            'dnd' => 'boolean',
            'lat' => 'float',
            'lng' => 'float',
            'cancel_count' => 'integer',
            'late_cancel_count' => 'integer',
            'no_show_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return HasMany<Service, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class)->orderBy('id');
    }

    /**
     * @return HasMany<Worker, $this>
     */
    public function workers(): HasMany
    {
        return $this->hasMany(Worker::class)->orderBy('id');
    }

    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Service>
     */
    public function serviceList()
    {
        return $this->services;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Worker>
     */
    public function workerList()
    {
        return $this->workers()->get();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function dayHours(): array
    {
        return WeeklyHours::toGraphQL($this->hours ?? WeeklyHours::closedWeek());
    }

    public function takeoverAllowed(): bool
    {
        return $this->dnd !== true && OpenNow::at($this);
    }
}
