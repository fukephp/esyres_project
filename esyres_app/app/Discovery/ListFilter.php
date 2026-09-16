<?php

namespace App\Discovery;

use Illuminate\Database\Eloquent\Builder;

final class ListFilter
{
    /**
     * @param  Builder<\App\Models\Salon>  $query
     */
    public static function apply(Builder $query, mixed $category, mixed $name): void
    {
        if (is_string($category) && $category !== '') {
            $query->whereHas('services', static function (Builder $services) use ($category): void {
                $services->whereHas('serviceCategory', static function (Builder $groups) use ($category): void {
                    $groups->where('legacy_key', $category);
                });
            });
        }
        $term = is_string($name) ? trim($name) : '';
        if ($term !== '') {
            $query->where('name', 'like', '%'.addcslashes($term, '%_\\').'%');
        }
    }
}
