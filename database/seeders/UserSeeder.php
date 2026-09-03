<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1 Owner (Pemilik Gudang)
        $pemilik = User::firstOrCreate(
            ['email' => 'pemilik@gudangdiesel.com'],
            [
                'name' => 'Bapak Hartono (Pemilik Gudang)',
                'password' => Hash::make('password'),
            ]
        );
        $pemilik->syncRoles(['pemilik']);

        // 5 Admin Gudang
        $adminsData = [
            [
                'email' => 'admin@gudangdiesel.com',
                'name' => 'Admin Gudang Utama',
            ],
            [
                'email' => 'budi.admin@gudangdiesel.com',
                'name' => 'Budi Santoso (Admin Shift Pagi)',
            ],
            [
                'email' => 'agus.admin@gudangdiesel.com',
                'name' => 'Agus Setiawan (Admin Shift Siang)',
            ],
            [
                'email' => 'rudi.admin@gudangdiesel.com',
                'name' => 'Rudi Hermawan (Admin Stock Opname)',
            ],
            [
                'email' => 'dewi.admin@gudangdiesel.com',
                'name' => 'Dewi Lestari (Admin Logistik)',
            ],
        ];

        foreach ($adminsData as $adminInfo) {
            $admin = User::firstOrCreate(
                ['email' => $adminInfo['email']],
                [
                    'name' => $adminInfo['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $admin->syncRoles(['admin']);
        }
    }
}
