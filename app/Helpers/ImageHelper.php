<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageHelper
{
    /**
     * Compress an uploaded image to WebP format (max 1200px, 80% quality) and save to disk.
     */
    public static function compressAndStore(UploadedFile $file, string $folder = 'receipts', int $maxWidth = 1200, int $quality = 80): string
    {
        $mime = $file->getMimeType();
        $realPath = $file->getRealPath();

        // Create GD image resource based on mime type
        $image = null;
        if (str_contains($mime, 'jpeg') || str_contains($mime, 'jpg')) {
            $image = @imagecreatefromjpeg($realPath);
        } elseif (str_contains($mime, 'png')) {
            $image = @imagecreatefrompng($realPath);
        } elseif (str_contains($mime, 'webp')) {
            $image = @imagecreatefromwebp($realPath);
        }

        // Fallback if GD fails to parse or image type is unsupported
        if (! $image) {
            return $file->store($folder, 'public');
        }

        // Handle PNG transparency
        imagealphablending($image, true);
        imagesavealpha($image, true);

        // Get original dimensions
        $width = imagesx($image);
        $height = imagesy($image);

        // Calculate target dimensions
        if ($width > $maxWidth || $height > $maxWidth) {
            if ($width >= $height) {
                $newWidth = $maxWidth;
                $newHeight = (int) round(($height / $width) * $maxWidth);
            } else {
                $newHeight = $maxWidth;
                $newWidth = (int) round(($width / $height) * $maxWidth);
            }

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($resizedImage, false);
            imagesavealpha($resizedImage, true);
            imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resizedImage;
        }

        // Save to temporary file in WebP format
        $filename = Str::random(40).'.webp';
        $tempPath = sys_get_temp_dir().'/'.$filename;

        imagewebp($image, $tempPath, $quality);
        imagedestroy($image);

        // Save compressed WebP file to public storage
        $relativePath = $folder.'/'.$filename;
        Storage::disk('public')->put($relativePath, file_get_contents($tempPath));

        @unlink($tempPath);

        return $relativePath;
    }
}
