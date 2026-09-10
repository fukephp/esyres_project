<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class BookingReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public string $kind,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $salon = $this->booking->salon->name;
        $when = $this->booking->preferred_starts_at->timezone('Europe/Sarajevo');
        $line = 'Imate termin u '.$salon.' '.$when->format('j. n. Y.').' u '.$when->format('H:i').'.';
        $subject = $this->kind === 'hour'
            ? 'Podsjetnik: '.$salon.' za sat vremena'
            : 'Podsjetnik: '.$salon.' sutra';

        return (new MailMessage)
            ->subject($subject)
            ->line($line);
    }
}
