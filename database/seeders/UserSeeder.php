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
        // 1 Pemilik Gudang (Sesuai Skripsi)
        $pemilik = User::firstOrCreate(
            ['email' => 'steven.owner@gudangdiesel.com'],
            [
                'name' => 'Steven Sanjaya',
                'password' => Hash::make('password'),
            ]
        );
        $pemilik->syncRoles(['pemilik']);

        // 9 Admin Gudang (Sesuai 9 Peneliti di Tabel Skripsi)
        $staffData = [
            [
                'email' => 'admin@gudangdiesel.com',
                'name' => 'Bagus Miftah Nur Haqqi',
            ],
            [
                'email' => 'masgo@gudangdiesel.com',
                'name' => 'Masgo',
            ],
            [
                'email' => 'ilyas@gudangdiesel.com',
                'name' => 'Muhammad Herie Ilyas Asfari',
            ],
            [
                'email' => 'putri@gudangdiesel.com',
                'name' => 'Putri Nurkasih',
            ],
            [
                'email' => 'saghifa@gudangdiesel.com',
                'name' => 'Saghifa Fitriana',
            ],
            [
                'email' => 'vito@gudangdiesel.com',
                'name' => 'Muhammad Vito Arya Apriza',
            ],
            [
                'email' => 'revo@gudangdiesel.com',
                'name' => 'Revo Mulia Alamsyah Harahap',
            ],
            [
                'email' => 'rasyid@gudangdiesel.com',
                'name' => 'Rum Mohamad Andri K. Rasyid',
            ],
            [
                'email' => 'shinta@gudangdiesel.com',
                'name' => 'Shinta',
            ],
        ];

        foreach ($staffData as $staffInfo) {
            $staff = User::firstOrCreate(
                ['email' => $staffInfo['email']],
                [
                    'name' => $staffInfo['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $staff->syncRoles(['admin']);
        }
    }
}
