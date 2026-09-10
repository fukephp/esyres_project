<?php

namespace App\Trust;

use App\Models\Salon;
use App\Models\User;

final class Counters
{
    public static function onCancel(User $customer, Salon $salon, bool $late): void
    {
        $customer->cancel_count = (int) $customer->cancel_count + 1;
        $salon->cancel_count = (int) $salon->cancel_count + 1;
        if ($late) {
            $customer->late_cancel_count = (int) $customer->late_cancel_count + 1;
            $salon->late_cancel_count = (int) $salon->late_cancel_count + 1;
        }
        $customer->save();
        $salon->save();
    }

    public static function onNoShow(User $customer, Salon $salon): void
    {
        $customer->no_show_count = (int) $customer->no_show_count + 1;
        $salon->no_show_count = (int) $salon->no_show_count + 1;
        $customer->save();
        $salon->save();
    }
}
