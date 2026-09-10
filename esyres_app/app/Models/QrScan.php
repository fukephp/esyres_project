<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'salon_id'])]
class QrScan extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    public function salonIdString(): string
    {
        return (string) $this->salon_id;
    }

    public function customerIdString(): string
    {
        return (string) $this->user_id;
    }

    public function createdAtIso(): string
    {
        return $this->created_at->clone()->utc()->toIso8601String();
    }
}
