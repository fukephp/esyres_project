<?php

namespace App\Models;

use App\Exceptions\ClientError;
use Database\Factories\WorkerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

#[Fillable(['salon_id', 'name'])]
class Worker extends Model
{
    /** @use HasFactory<WorkerFactory> */
    use HasFactory;

    public const LIST_FIELDS = ['talents', 'specializations', 'certificates', 'education', 'brands'];

    public const MAX_LIST_ROWS = 20;

    public const MAX_LIST_ROW_LENGTH = 80;

    public const MAX_STRONGEST = 5;

    /** @var list<int>|null */
    private ?array $pendingStrongest = null;

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'talents' => 'array',
            'specializations' => 'array',
            'certificates' => 'array',
            'education' => 'array',
            'brands' => 'array',
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
     * @return BelongsToMany<Service, $this>
     */
    public function strongestServices(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'worker_strongest_services');
    }

    /**
     * @param  array{name: string, profile?: array<string, mixed>|null}  $input
     */
    public function fillFromInput(array $input): void
    {
        $name = trim($input['name']);
        if ($name === '') {
            throw new ClientError('INVALID_NAME');
        }

        $this->name = $name;

        $profile = $input['profile'] ?? null;
        if (is_array($profile)) {
            $this->fillProfile($profile);
        }
    }

    public function saveOrDuplicate(): void
    {
        try {
            DB::transaction(function (): void {
                $this->save();
                if ($this->pendingStrongest !== null) {
                    $this->strongestServices()->sync($this->pendingStrongest);
                    $this->pendingStrongest = null;
                }
            });
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) {
                throw new ClientError('DUPLICATE_WORKER_NAME');
            }
            throw $e;
        }
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    private function fillProfile(array $profile): void
    {
        $about = self::optionalText($profile['about'] ?? null);
        if ($about !== null && mb_strlen($about) > 1000) {
            throw new ClientError('ABOUT_TOO_LONG');
        }

        $years = $profile['experienceYears'] ?? null;
        if ($years !== null && (! is_int($years) || $years < 0 || $years > 60)) {
            throw new ClientError('INVALID_EXPERIENCE');
        }

        $url = self::optionalText($profile['portfolioUrl'] ?? null);
        if ($url !== null && (preg_match('#^https?://\S+$#i', $url) !== 1 || mb_strlen($url) > 2048)) {
            throw new ClientError('INVALID_PORTFOLIO_URL');
        }

        $maintenance = self::optionalText($profile['maintenance'] ?? null);
        if ($maintenance !== null && mb_strlen($maintenance) > 300) {
            throw new ClientError('MAINTENANCE_TOO_LONG');
        }

        $lists = [];
        foreach (self::LIST_FIELDS as $field) {
            $lists[$field] = self::cleanList($profile[$field] ?? []);
        }

        $ids = array_values(array_unique(array_map('intval', is_array($profile['strongestServiceIds'] ?? null) ? $profile['strongestServiceIds'] : [])));
        if (count($ids) > self::MAX_STRONGEST) {
            throw new ClientError('TOO_MANY_STRONGEST');
        }
        if ($ids !== [] && Service::query()->where('salon_id', $this->salon_id)->whereIn('id', $ids)->count() !== count($ids)) {
            throw new ClientError('INVALID_SERVICE');
        }

        $this->about = $about;
        $this->experience_years = $years;
        $this->portfolio_url = $url;
        $this->maintenance = $maintenance;
        foreach ($lists as $field => $rows) {
            $this->{$field} = $rows;
        }
        $this->pendingStrongest = $ids;
    }

    private static function optionalText(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * @return list<string>
     */
    private static function cleanList(mixed $rows): array
    {
        $clean = [];
        foreach (is_array($rows) ? $rows : [] as $row) {
            $row = self::optionalText($row);
            if ($row === null) {
                continue;
            }
            if (mb_strlen($row) > self::MAX_LIST_ROW_LENGTH) {
                throw new ClientError('LIST_ROW_TOO_LONG');
            }
            $clean[] = $row;
        }
        if (count($clean) > self::MAX_LIST_ROWS) {
            throw new ClientError('LIST_TOO_LONG');
        }

        return $clean;
    }
}
