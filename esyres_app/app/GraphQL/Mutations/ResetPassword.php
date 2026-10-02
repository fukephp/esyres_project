<?php

namespace App\GraphQL\Mutations;

use App\Exceptions\ClientError;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class ResetPassword
{
    /**
     * @param  array{email: string, token: string, password: string}  $args
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context): bool
    {
        if (strlen($args['password']) < 8) {
            throw new ClientError('WEAK_PASSWORD');
        }

        $resetUser = null;
        $status = Password::broker()->reset(
            [
                'email' => strtolower(trim($args['email'])),
                'token' => $args['token'],
                'password' => $args['password'],
            ],
            function (User $user, string $password) use (&$resetUser): void {
                $user->password = $password;
                $user->setRememberToken(Str::random(60));
                $user->save();
                $resetUser = $user;
            },
        );

        if ($status !== Password::PASSWORD_RESET || ! $resetUser instanceof User) {
            throw new ClientError('INVALID_RESET_TOKEN');
        }

        DB::table((string) config('session.table', 'sessions'))->where('user_id', $resetUser->id)->delete();

        $sessionUser = $context->user();
        if ($sessionUser instanceof User && (int) $sessionUser->getAuthIdentifier() === (int) $resetUser->id) {
            Auth::guard('web')->logout();
            $context->request()->session()->invalidate();
            $context->request()->session()->regenerateToken();
        }

        return true;
    }
}
