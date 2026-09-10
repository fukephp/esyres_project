<?php

namespace App\Http\Controllers;

use App\Models\QrHit;
use App\Models\Salon;
use App\Models\User;
use App\Qr\QrHold;
use App\Qr\ReconcileQrHold;
use App\Support\SpaUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class QrController
{
    public function __invoke(Request $request, string $salon, ReconcileQrHold $reconcile): RedirectResponse
    {
        $row = Salon::query()->find($salon);
        if ($row === null) {
            QrHold::forget();

            return redirect()->away(SpaUrl::home());
        }

        QrHit::record($row);

        $user = $request->user();
        if ($user instanceof User && ReconcileQrHold::hasTimestamps($user)) {
            $reconcile->forSalon($user, $row);

            return redirect()->away(SpaUrl::salon((string) $row->id));
        }

        QrHold::set((string) $row->id);

        return redirect()->away(SpaUrl::salon((string) $row->id));
    }
}
