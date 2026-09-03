<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class IncomingItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference_no',
        'item_id',
        'quantity',
        'date',
        'supplier',
        'notes',
        'invoice_image',
        'user_id',
    ];

    protected $appends = [
        'invoice_image_url',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'quantity' => 'integer',
        ];
    }

    public function getInvoiceImageUrlAttribute(): ?string
    {
        return $this->invoice_image ? Storage::url($this->invoice_image) : null;
    }

    /**
     * Get the item associated with this transaction.
     *
     * @return BelongsTo<Item, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the edit audit logs for this transaction.
     */
    public function editLogs(): MorphMany
    {
        return $this->morphMany(TransactionEditLog::class, 'auditable')->latest();
    }

    /**
     * Get the user who recorded this transaction.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
