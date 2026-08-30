<?php

namespace App\Otp;

use App\Exceptions\ClientError;
use App\Jobs\SendPhoneOtp;
use App\Models\User;
use App\Phone\E164;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

final class PhoneOtp
{
    public function request(User $user, string $rawPhone, string $ip): void
    {
        if ($user->phone_verified_at !== null) {
            throw new ClientError('PHONE_ALREADY_VERIFIED');
        }

        $phone = E164::normalize($rawPhone);
        if (User::query()->where('phone', $phone)->where('id', '!=', $user->id)->exists()) {
            throw new ClientError('PHONE_TAKEN');
        }

        $phoneKey = 'otp-send-phone:'.$phone;
        $ipKey = 'otp-send-ip:'.$ip;
        if (RateLimiter::tooManyAttempts($phoneKey, 1) || RateLimiter::tooManyAttempts($ipKey, 1)) {
            throw new ClientError('TOO_MANY_ATTEMPTS');
        }

        $user->phone = $phone;
        $user->save();

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put($this->codeKey($user), hash_hmac('sha256', $code, (string) config('app.key')), 300);
        RateLimiter::hit($phoneKey, 60);
        RateLimiter::hit($ipKey, 60);
        SendPhoneOtp::dispatch($phone, $code);
    }

    public function verify(User $user, string $code): void
    {
        if ($user->phone_verified_at !== null) {
            throw new ClientError('PHONE_ALREADY_VERIFIED');
        }

        $failKey = 'otp-fail:'.$user->id;
        if (RateLimiter::tooManyAttempts($failKey, 5)) {
            throw new ClientError('TOO_MANY_ATTEMPTS');
        }

        $stored = Cache::get($this->codeKey($user));
        $hashed = hash_hmac('sha256', $code, (string) config('app.key'));
        if (! is_string($stored) || ! hash_equals($stored, $hashed)) {
            RateLimiter::hit($failKey, 15 * 60);
            throw new ClientError('INVALID_OTP');
        }

        $user->phone_verified_at = now();
        $user->save();
        Cache::forget($this->codeKey($user));
        RateLimiter::clear($failKey);
    }

    private function codeKey(User $user): string
    {
        return 'otp-code:'.$user->id;
    }
}
