<?php

namespace App\Qr;

use App\Models\Favorite;
use App\Models\QrScan;
use App\Models\Salon;
use App\Models\User;
use Illuminate\Http\Request;

final class ReconcileQrHold
{
    public function fromRequest(?User $user, Request $request): void
    {
        $raw = $request->cookie(QrHold::COOKIE);
        if (! is_string($raw) || $raw === '') {
            return;
        }
        if ($user === null || ! self::hasTimestamps($user)) {
            return;
        }
        if (! ctype_digit($raw)) {
            QrHold::forget();

            return;
        }
        $salon = Salon::query()->find($raw);
        if ($salon === null) {
            QrHold::forget();

            return;
        }
        $this->forSalon($user, $salon);
    }

    public function forSalon(User $user, Salon $salon): void
    {
        Favorite::query()->firstOrCreate([
            'user_id' => $user->id,
            'salon_id' => $salon->id,
        ]);
        QrScan::query()->create([
            'user_id' => $user->id,
            'salon_id' => $salon->id,
        ]);
        QrHold::forget();
    }

    public static function hasTimestamps(User $user): bool
    {
        return $user->email_verified_at !== null && $user->phone_verified_at !== null;
    }
}
