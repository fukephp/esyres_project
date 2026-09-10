<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['salon_id'])]
class QrHit extends Model
{
    /**
     * @return BelongsTo<Salon, $this>
     */
    public function salon(): BelongsTo
    {
        return $this->belongsTo(Salon::class);
    }

    public static function record(Salon $salon): void
    {
        self::query()->create(['salon_id' => $salon->id]);
    }

    public static function backfillFromVisits(): void
    {
        QrScan::query()->orderBy('id')->each(function (QrScan $row): void {
            $hit = new self;
            $hit->salon_id = $row->salon_id;
            $hit->created_at = $row->created_at;
            $hit->updated_at = $row->updated_at;
            $hit->save();
        });
    }

    public static function conversionPercent(int $scanCount, int $visitCount): int
    {
        if ($scanCount === 0) {
            return 0;
        }

        return (int) round(100 * $visitCount / $scanCount);
    }
}
