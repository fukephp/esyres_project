<?php

namespace App\Providers;

use App\Sms\FakeSmsGateway;
use App\Sms\LogSmsGateway;
use App\Sms\SmsGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SmsGateway::class, function ($app) {
            return $app->environment('testing')
                ? new FakeSmsGateway
                : new LogSmsGateway;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
