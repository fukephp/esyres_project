<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as LaravelVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

final class VerifyEmail extends LaravelVerifyEmail implements ShouldQueue
{
    use Queueable;
}
