<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_code',
        'name',
        'category_id',
        'unit_id',
        'stock',
        'min_stock',
        'rack_location',
    ];

    /**
     * Get the category that owns the item.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the unit that owns the item.
     *
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the incoming items transaction for this item.
     *
     * @return HasMany<IncomingItem, $this>
     */
    public function incomingItems(): HasMany
    {
        return $this->hasMany(IncomingItem::class);
    }

    /**
     * Get the outgoing items transaction for this item.
     *
     * @return HasMany<OutgoingItem, $this>
     */
    public function outgoingItems(): HasMany
    {
        return $this->hasMany(OutgoingItem::class);
    }

    /**
     * Check if item stock is low (below or equal to min_stock).
     */
    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }
}
