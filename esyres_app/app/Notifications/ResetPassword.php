<?php

namespace App\Notifications;

use App\Support\SpaUrl;
use Illuminate\Auth\Notifications\ResetPassword as LaravelResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

final class ResetPassword extends LaravelResetPassword implements ShouldQueue
{
    use Queueable;

    protected function resetUrl($notifiable): string
    {
        return SpaUrl::resetPassword($this->token, $notifiable->getEmailForPasswordReset());
    }
}
