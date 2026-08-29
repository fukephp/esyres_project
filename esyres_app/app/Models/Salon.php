<?php

namespace App\Models;

use App\SalonHours\WeeklyHours;
use Database\Factories\SalonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'name', 'cancellation_notice_hours', 'hours'])]
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
     * @return \Illuminate\Database\Eloquent\Collection<int, Service>
     */
    public function serviceList()
    {
        return $this->services()->get();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function dayHours(): array
    {
        return WeeklyHours::toGraphQL($this->hours ?? WeeklyHours::closedWeek());
    }
}
