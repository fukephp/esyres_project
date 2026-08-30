<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use App\Phone\E164;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class Register
{
    /**
     * @param  array{email: string, password: string, phone?: string|null}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): User
    {
        $email = strtolower(trim($args['email']));
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new ClientError('INVALID_EMAIL');
        }
        if (strlen($args['password']) < 8) {
            throw new ClientError('WEAK_PASSWORD');
        }
        if (User::query()->where('email', $email)->exists()) {
            throw new ClientError('EMAIL_TAKEN');
        }

        $phone = E164::optional($args['phone'] ?? null);
        if ($phone !== null && User::query()->where('phone', $phone)->exists()) {
            throw new ClientError('PHONE_TAKEN');
        }

        $user = new User;
        $user->name = explode('@', $email)[0];
        $user->email = $email;
        $user->phone = $phone;
        $user->password = $args['password'];
        $user->save();

        Auth::login($user);
        $context->request()->session()->regenerate();
        $user->sendEmailVerificationNotification();

        return $user;
    }
}
