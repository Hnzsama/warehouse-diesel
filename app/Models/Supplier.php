<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'phone',
        'email',
        'address',
        'notes',
    ];

    /**
     * Get the incoming item transactions associated with this supplier.
     *
     * @return HasMany<IncomingItem, $this>
     */
    public function incomingItems(): HasMany
    {
        return $this->hasMany(IncomingItem::class);
    }

    /**
     * Get the outgoing item transactions associated with this supplier.
     *
     * @return HasMany<OutgoingItem, $this>
     */
    public function outgoingItems(): HasMany
    {
        return $this->hasMany(OutgoingItem::class);
    }
}
