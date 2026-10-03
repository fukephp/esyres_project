<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['salon_rating_id', 'user_id', 'body'])]
class RatingReply extends Model
{
    /**
     * @return BelongsTo<SalonRating, $this>
     */
    public function rating(): BelongsTo
    {
        return $this->belongsTo(SalonRating::class, 'salon_rating_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function authorName(): string
    {
        return (string) $this->user?->name;
    }
}
