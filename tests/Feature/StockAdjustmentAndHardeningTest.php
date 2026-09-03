<?php

use App\Helpers\ReferenceNumberGenerator;
use App\Models\Category;
use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\OutgoingItem;
use App\Models\StockAdjustment;
use App\Models\Unit;
use App\Models\User;

test('reference number generator creates unique sequential numbers', function () {
    $ref1 = ReferenceNumberGenerator::generateIncomingRef();
    $ref2 = ReferenceNumberGenerator::generateOutgoingRef();
    $ref3 = ReferenceNumberGenerator::generateAdjustmentRef();

    expect($ref1)->toContain('IN-')
        ->and($ref2)->toContain('OUT-')
        ->and($ref3)->toContain('ADJ-');
});

test('authenticated user can record stock adjustment and item stock updates accordingly', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Mesin', 'slug' => 'mesin']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'TEST-001',
        'name' => 'Filter Solar Test',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
        'min_stock' => 2,
    ]);

    $response = $this->actingAs($user)->post('/stock-adjustments', [
        'reference_no' => 'ADJ-TEST-001',
        'item_id' => $item->id,
        'type' => 'reduction',
        'quantity' => 3,
        'reason' => 'damaged',
        'notes' => 'Filter pecah',
        'date' => now()->toDateTimeString(),
    ]);

    $response->assertRedirect();
    expect($item->fresh()->stock)->toBe(7);
    $this->assertDatabaseHas('stock_adjustments', [
        'reference_no' => 'ADJ-TEST-001',
        'reason' => 'damaged',
        'quantity' => 3,
    ]);
});

test('deleting an item soft deletes record in database', function () {
    $category = Category::create(['name' => 'Oli', 'slug' => 'oli']);
    $unit = Unit::create(['name' => 'Liter', 'short_name' => 'L']);
    $item = Item::create([
        'item_code' => 'OLI-001',
        'name' => 'Oli Meditran',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 50,
        'min_stock' => 5,
    ]);

    $item->delete();

    $this->assertSoftDeleted('items', ['id' => $item->id]);
});
