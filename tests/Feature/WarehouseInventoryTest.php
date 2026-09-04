<?php

use App\Models\Category;
use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\OutgoingItem;
use App\Models\Unit;
use App\Models\User;

test('authenticated user can view dashboard stats', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});

test('admin can create new sparepart item', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Mesin', 'slug' => 'mesin']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);

    $response = $this->actingAs($user)->post('/items', [
        'item_code' => 'TST-001',
        'name' => 'Piston Test',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
        'min_stock' => 2,
        'rack_location' => 'Rak A1',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('items', [
        'item_code' => 'TST-001',
        'name' => 'Piston Test',
        'stock' => 10,
    ]);
});

test('incoming item transaction automatically increases item stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-001',
        'name' => 'Filter Oli',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 20,
        'min_stock' => 5,
    ]);

    $response = $this->actingAs($user)->post('/incoming-items', [
        'reference_no' => 'IN-0001',
        'item_id' => $item->id,
        'quantity' => 15,
        'date' => now()->toDateString(),
        'supplier' => 'PT Distributor Diesel',
        'notes' => 'Stok tambahan',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('incoming_items', [
        'reference_no' => 'IN-0001',
        'quantity' => 15,
    ]);
    expect($item->fresh()->stock)->toBe(35);
});

test('outgoing item transaction automatically decreases item stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-002',
        'name' => 'Filter Solar',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 20,
        'min_stock' => 5,
    ]);

    $response = $this->actingAs($user)->post('/outgoing-items', [
        'reference_no' => 'OUT-0001',
        'item_id' => $item->id,
        'quantity' => 8,
        'date' => now()->toDateString(),
        'recipient' => 'Truk Hino B 1234 CD',
        'notes' => 'Penggantian rutin',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('outgoing_items', [
        'reference_no' => 'OUT-0001',
        'quantity' => 8,
    ]);
    expect($item->fresh()->stock)->toBe(12);
});

test('outgoing item transaction prevents negative stock when quantity exceeds available stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-003',
        'name' => 'Filter Udara',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 5,
        'min_stock' => 2,
    ]);

    $response = $this->actingAs($user)->post('/outgoing-items', [
        'reference_no' => 'OUT-0002',
        'item_id' => $item->id,
        'quantity' => 10, // Exceeds available stock (5)
        'date' => now()->toDateString(),
    ]);

    $response->assertSessionHasErrors('quantity');
    expect($item->fresh()->stock)->toBe(5);
});

test('authenticated user can access report page', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get('/reports?report_type=stock');

    $response->assertStatus(200);
});

test('admin can edit incoming item transaction and reconcile stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter-edit']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-004',
        'name' => 'Filter Bensin',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
        'min_stock' => 2,
    ]);

    $incoming = IncomingItem::create([
        'reference_no' => 'IN-0010',
        'item_id' => $item->id,
        'quantity' => 10,
        'date' => now()->toDateString(),
        'user_id' => $user->id,
    ]);
    $item->increment('stock', 10);

    $response = $this->actingAs($user)->put("/incoming-items/{$incoming->id}", [
        'reference_no' => 'IN-0010-UPDATED',
        'item_id' => $item->id,
        'quantity' => 15,
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    expect($item->fresh()->stock)->toBe(25);
});

test('admin can delete incoming item transaction and decrease stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter-del']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-005',
        'name' => 'Filter Oli Super',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 30,
        'min_stock' => 2,
    ]);

    $incoming = IncomingItem::create([
        'reference_no' => 'IN-0020',
        'item_id' => $item->id,
        'quantity' => 10,
        'date' => now()->toDateString(),
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->delete("/incoming-items/{$incoming->id}");

    $response->assertRedirect();
    expect($item->fresh()->stock)->toBe(20);
});

test('admin can delete outgoing item transaction and restore stock', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');
    $category = Category::create(['name' => 'Filter', 'slug' => 'filter-out-del']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-006',
        'name' => 'Filter Solar Super',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 15,
        'min_stock' => 2,
    ]);

    $outgoing = OutgoingItem::create([
        'reference_no' => 'OUT-0020',
        'item_id' => $item->id,
        'quantity' => 5,
        'date' => now()->toDateString(),
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->delete("/outgoing-items/{$outgoing->id}");

    $response->assertRedirect();
    expect($item->fresh()->stock)->toBe(20);
});
