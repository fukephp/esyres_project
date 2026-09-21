<?php

namespace App\SalonMedia;

use App\Exceptions\ClientError;
use App\Models\Salon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class SalonImages
{
    public const MAX_BYTES = 5 * 1024 * 1024;

    public const MAX_GALLERY = 6;

    /** @var array<string, string> */
    private const MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public static function publicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return '/storage/'.$path;
    }

    /**
     * @return list<string>
     */
    public static function galleryUrls(Salon $salon): array
    {
        $urls = [];
        foreach (self::paths($salon) as $path) {
            $url = self::publicUrl($path);
            if ($url !== null) {
                $urls[] = $url;
            }
        }

        return $urls;
    }

    public static function storeMain(Salon $salon, UploadedFile $file): void
    {
        $ext = self::extension($file);
        $old = $salon->main_image_path;
        $path = $file->storeAs('salons/'.$salon->id, 'main.'.$ext, 'public');
        if (! is_string($path) || $path === '') {
            throw new ClientError('INVALID_IMAGE_TYPE');
        }
        if ($old !== null && $old !== '' && $old !== $path) {
            Storage::disk('public')->delete($old);
        }
        $salon->main_image_path = $path;
        $salon->save();
    }

    public static function removeMain(Salon $salon): void
    {
        $old = $salon->main_image_path;
        if ($old === null || $old === '') {
            return;
        }
        Storage::disk('public')->delete($old);
        $salon->main_image_path = null;
        $salon->save();
    }

    public static function storeGallery(Salon $salon, UploadedFile $file): void
    {
        $paths = self::paths($salon);
        if (count($paths) >= self::MAX_GALLERY) {
            throw new ClientError('GALLERY_FULL');
        }
        $ext = self::extension($file);
        $path = $file->storeAs('salons/'.$salon->id.'/gallery', Str::lower((string) Str::ulid()).'.'.$ext, 'public');
        if (! is_string($path) || $path === '') {
            throw new ClientError('INVALID_IMAGE_TYPE');
        }
        $paths[] = $path;
        $salon->gallery_paths = $paths;
        $salon->save();
    }

    public static function removeGallery(Salon $salon, int $index): void
    {
        $paths = self::paths($salon);
        if ($index < 0 || $index >= count($paths)) {
            throw new ClientError('INVALID_GALLERY_INDEX');
        }
        $old = $paths[$index];
        Storage::disk('public')->delete($old);
        array_splice($paths, $index, 1);
        $salon->gallery_paths = array_values($paths);
        $salon->save();
    }

    /**
     * @return list<string>
     */
    private static function paths(Salon $salon): array
    {
        $raw = $salon->gallery_paths;
        if (! is_array($raw)) {
            return [];
        }
        $paths = [];
        foreach ($raw as $path) {
            if (is_string($path) && $path !== '') {
                $paths[] = $path;
            }
        }

        return $paths;
    }

    private static function extension(UploadedFile $file): string
    {
        if ($file->getSize() > self::MAX_BYTES) {
            throw new ClientError('IMAGE_TOO_LARGE');
        }
        $name = strtolower($file->getClientOriginalName());
        if (str_ends_with($name, '.gif') || str_ends_with($name, '.svg') || str_ends_with($name, '.heic') || str_ends_with($name, '.heif')) {
            throw new ClientError('INVALID_IMAGE_TYPE');
        }
        $detected = $file->getMimeType() ?: '';
        $client = $file->getClientMimeType() ?: '';
        $ext = self::MIMES[$detected] ?? self::MIMES[$client] ?? null;
        if ($ext === null) {
            throw new ClientError('INVALID_IMAGE_TYPE');
        }

        return $ext;
    }
}
