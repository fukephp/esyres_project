<?php

namespace App\Policies;

use App\Models\Salon;
use App\Models\User;

class SalonPolicy
{
    public function view(User $user, Salon $salon): bool
    {
        return $user->hasVerifiedEmail() && $user->id === $salon->owner_id;
    }

    public function update(User $user, Salon $salon): bool
    {
        return $this->view($user, $salon);
    }
}
