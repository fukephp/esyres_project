<?php

namespace App\Models;

use App\Exceptions\ClientError;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\QueryException;

#[Fillable(['salon_id', 'name', 'category', 'duration_minutes', 'price_feninga'])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'price_feninga' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    /**
     * @param  array{name: string, category: string, durationMinutes?: int|null, priceFeninga: int}  $input
     */
    public function fillFromInput(array $input): void
    {
        $name = trim($input['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }

        $duration = $input['durationMinutes'] ?? 30;
        if (! is_int($duration) || $duration < 15 || $duration % 15 !== 0) {
            throw new ClientError('INVALID_DURATION');
        }

        $price = $input['priceFeninga'];
        if (! is_int($price) || $price < 0) {
            throw new ClientError('INVALID_PRICE');
        }

        $this->name = $name;
        $this->category = $input['category'];
        $this->duration_minutes = $duration;
        $this->price_feninga = $price;
    }

    public function saveOrDuplicate(): void
    {
        try {
            $this->save();
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                throw new ClientError('DUPLICATE_SERVICE_NAME');
            }
            throw $e;
        }
    }
};
