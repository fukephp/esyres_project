<?php

namespace App\Models;

use App\Exceptions\ClientError;
use Database\Factories\WorkerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\QueryException;

#[Fillable(['salon_id', 'name'])]
class Worker extends Model
{
    /** @use HasFactory<WorkerFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    /**
     * @param  array{name: string}  $input
     */
    public function fillFromInput(array $input): void
    {
        $name = trim($input['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }

        $this->name = $name;
    }

    public function saveOrDuplicate(): void
    {
        try {
            $this->save();
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                throw new ClientError('DUPLICATE_WORKER_NAME');
            }
            throw $e;
        }
    }
}
