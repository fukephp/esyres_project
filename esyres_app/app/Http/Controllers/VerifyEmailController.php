<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\SpaUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class VerifyEmailController
{
    public function __invoke(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::query()->find($id);
        if ($user === null || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect()->away(SpaUrl::bookings('verify=invalid'));
        }

        $sessionUser = $request->user();
        if ($sessionUser instanceof User && (int) $sessionUser->getAuthIdentifier() !== (int) $user->getAuthIdentifier()) {
            return redirect()->away(SpaUrl::bookings('verify=mismatch'));
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect()->away(SpaUrl::bookings('verified=1'));
    }
}
