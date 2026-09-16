<?php

namespace App\Models;

use App\Exceptions\ClientError;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;

#[Fillable(['salon_id', 'name', 'legacy_key'])]
class SalonServiceCategory extends Model
{
    protected $table = 'service_categories';
    public const LEGACY_NAMES = [
        'HAIR' => 'Kosa',
        'MAKE_UP' => 'Šminka',
        'MASSAGE' => 'Masaža',
    ];

    public static function firstOrCreateLegacy(int $salonId, string $key): self
    {
        $name = self::LEGACY_NAMES[$key] ?? null;
        if ($name === null) {
            throw new ClientError('INVALID_CATEGORY');
        }

        return self::query()->firstOrCreate(
            ['salon_id' => $salonId, 'legacy_key' => $key],
            ['name' => $name],
        );
    }

    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    /**
     * @return HasMany<Service, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'service_category_id')->orderBy('id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Service>
     */
    public function serviceList()
    {
        return $this->services;
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
                throw new ClientError('DUPLICATE_CATEGORY_NAME');
            }
            throw $e;
        }
    }
}
