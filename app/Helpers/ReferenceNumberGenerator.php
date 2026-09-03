<?php

namespace App\Helpers;

use App\Models\IncomingItem;
use App\Models\OutgoingItem;
use App\Models\StockAdjustment;

class ReferenceNumberGenerator
{
    /**
     * Generate sequential reference number for Incoming Item transactions (IN-YYYYMMDD-XXX).
     */
    public static function generateIncomingRef(): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "IN-{$dateStr}-";

        $latest = IncomingItem::withTrashed()
            ->where('reference_no', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (! $latest) {
            return "{$prefix}001";
        }

        $lastSeq = (int) substr($latest->reference_no, -3);
        $nextSeq = str_pad((string) ($lastSeq + 1), 3, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextSeq}";
    }

    /**
     * Generate sequential reference number for Outgoing Item transactions (OUT-YYYYMMDD-XXX).
     */
    public static function generateOutgoingRef(): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "OUT-{$dateStr}-";

        $latest = OutgoingItem::withTrashed()
            ->where('reference_no', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (! $latest) {
            return "{$prefix}001";
        }

        $lastSeq = (int) substr($latest->reference_no, -3);
        $nextSeq = str_pad((string) ($lastSeq + 1), 3, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextSeq}";
    }

    /**
     * Generate sequential reference number for Stock Adjustments (ADJ-YYYYMMDD-XXX).
     */
    public static function generateAdjustmentRef(): string
    {
        $dateStr = now()->format('Ymd');
        $prefix = "ADJ-{$dateStr}-";

        $latest = StockAdjustment::withTrashed()
            ->where('reference_no', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (! $latest) {
            return "{$prefix}001";
        }

        $lastSeq = (int) substr($latest->reference_no, -3);
        $nextSeq = str_pad((string) ($lastSeq + 1), 3, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextSeq}";
    }
}
