<?php

use App\Models\Category;
use App\Models\Item;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;

test('admin can view suppliers list', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    Supplier::create([
        'code' => 'SUP-TEST-001',
        'name' => 'PT Test Supplier',
        'phone' => '08123456789',
    ]);

    $response = $this->actingAs($user)->get('/suppliers');

    $response->assertStatus(200);
});

test('admin can create new supplier', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->post('/suppliers', [
        'code' => 'SUP-0099',
        'name' => 'PT Supplier Utama Diesel',
        'phone' => '061-123456',
        'email' => 'contact@supplierutama.com',
        'address' => 'Jl. Krakatau No. 10',
        'notes' => 'Supplier resmi',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('suppliers', [
        'code' => 'SUP-0099',
        'name' => 'PT Supplier Utama Diesel',
    ]);
});

test('admin can update supplier', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $supplier = Supplier::create([
        'code' => 'SUP-0088',
        'name' => 'PT Supplier Lama',
        'phone' => '061-000000',
    ]);

    $response = $this->actingAs($user)->put("/suppliers/{$supplier->id}", [
        'code' => 'SUP-0088',
        'name' => 'PT Supplier Baru Perusahaan',
        'phone' => '061-999999',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'name' => 'PT Supplier Baru Perusahaan',
        'phone' => '061-999999',
    ]);
});

test('admin can soft delete supplier', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $supplier = Supplier::create([
        'code' => 'SUP-DEL-01',
        'name' => 'Supplier Hapus',
    ]);

    $response = $this->actingAs($user)->delete("/suppliers/{$supplier->id}");

    $response->assertRedirect();
    $this->assertSoftDeleted('suppliers', [
        'id' => $supplier->id,
    ]);
});

test('incoming transaction can select supplier via supplier_id', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $category = Category::create(['name' => 'Filter', 'slug' => 'filter-sup-test']);
    $unit = Unit::create(['name' => 'Pcs', 'short_name' => 'pcs']);
    $item = Item::create([
        'item_code' => 'FLT-SUP-001',
        'name' => 'Filter Solar Heavy Duty',
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
        'min_stock' => 2,
    ]);

    $supplier = Supplier::create([
        'code' => 'SUP-INK-01',
        'name' => 'PT Diesel Link Supplier',
    ]);

    $response = $this->actingAs($user)->post('/incoming-items', [
        'reference_no' => 'IN-SUP-0001',
        'item_id' => $item->id,
        'supplier_id' => $supplier->id,
        'quantity' => 10,
        'date' => now()->toDateString(),
        'notes' => 'Restok via dropdown supplier',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('incoming_items', [
        'reference_no' => 'IN-SUP-0001',
        'supplier_id' => $supplier->id,
        'supplier' => 'PT Diesel Link Supplier',
    ]);
});
