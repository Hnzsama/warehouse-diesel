<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'pemilik']);
});

test('admin can view user management page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->withoutVite()->get('/users');
    $response->assertOk();
});

test('admin can create new admin user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->withoutVite()->post('/users', [
        'name' => 'Admin Baru Gudang',
        'email' => 'adminbaru@gudangdiesel.com',
        'password' => 'qawsed123',
        'role' => 'admin',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'adminbaru@gudangdiesel.com',
    ]);

    $newUser = User::where('email', 'adminbaru@gudangdiesel.com')->first();
    expect($newUser->hasRole('admin'))->toBeTrue();
});

test('admin cannot delete own account', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->withoutVite()->delete("/users/{$admin->id}");

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
    ]);
});
