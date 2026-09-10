<?php

namespace App\Models;

use App\Notifications\VerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'cancel_count' => 'integer',
            'late_cancel_count' => 'integer',
            'no_show_count' => 'integer',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }

    public function hasVerifiedEmail(): bool
    {
        return app()->environment('local') || $this->email_verified_at !== null;
    }

    public function hasVerifiedPhone(): bool
    {
        return app()->environment('local') || $this->phone_verified_at !== null;
    }

    /**
     * @return HasMany<Salon, $this>
     */
    public function salons(): HasMany
    {
        return $this->hasMany(Salon::class, 'owner_id');
    }

    /**
     * @return HasMany<PushSubscription, $this>
     */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * @return BelongsToMany<Salon, $this>
     */
    public function favoriteSalons(): BelongsToMany
    {
        return $this->belongsToMany(Salon::class, 'favorites')->withTimestamps();
    }

    /**
     * @return HasMany<QrScan, $this>
     */
    public function qrScans(): HasMany
    {
        return $this->hasMany(QrScan::class);
    }

    /**
     * @return list<string>
     */
    public function favoriteSalonIdList(): array
    {
        return Favorite::query()
            ->where('user_id', $this->id)
            ->orderBy('salon_id')
            ->pluck('salon_id')
            ->map(fn (mixed $id): string => (string) $id)
            ->values()
            ->all();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Salon>
     */
    public function salonList()
    {
        return $this->salons()->orderBy('id')->get();
    }
}
