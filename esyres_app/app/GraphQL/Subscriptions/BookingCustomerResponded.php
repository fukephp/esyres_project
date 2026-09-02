<?php

namespace App\GraphQL\Subscriptions;

use App\GraphQL\OwnerAccess;
use App\Models\Booking;
use Illuminate\Http\Request;
use Nuwave\Lighthouse\Schema\Types\GraphQLSubscription;
use Nuwave\Lighthouse\Subscriptions\Subscriber;

final class BookingCustomerResponded extends GraphQLSubscription
{
    public function can(Subscriber $subscriber): bool
    {
        OwnerAccess::salon(
            OwnerAccess::user($subscriber->context),
            (string) $subscriber->args['salonId'],
        );

        return true;
    }

    public function authorize(Subscriber $subscriber, Request $request): bool
    {
        return $this->can($subscriber);
    }

    public function filter(Subscriber $subscriber, mixed $root): bool
    {
        return (int) $root->salon_id === (int) $subscriber->args['salonId'];
    }

    public function encodeTopic(Subscriber $subscriber, string $fieldName): string
    {
        return $fieldName.':'.$subscriber->args['salonId'];
    }

    /**
     * @param  Booking  $root
     */
    public function decodeTopic(string $fieldName, mixed $root): string
    {
        return $fieldName.':'.$root->salon_id;
    }
}
