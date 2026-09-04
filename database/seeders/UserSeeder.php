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

        // Pemilik alias login
        $pemilikAlias = User::firstOrCreate(
            ['email' => 'pemilik@gudangdiesel.com'],
            [
                'name' => 'Steven Sanjaya (Owner)',
                'password' => Hash::make('password'),
            ]
        );
        $pemilikAlias->syncRoles(['pemilik']);

        // 2 Admin Gudang Utama (Full Access)
        $mainAdmins = [
            [
                'email' => 'admin@gudangdiesel.com',
                'name' => 'Bagus Miftah Nur Haqqi',
            ],
            [
                'email' => 'masgo@gudangdiesel.com',
                'name' => 'Masgo',
            ],
        ];

        foreach ($mainAdmins as $info) {
            $user = User::firstOrCreate(
                ['email' => $info['email']],
                [
                    'name' => $info['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles(['admin']);
        }

        // 4 Staf Operasional Gudang (Pencatatan Barang Masuk & Keluar)
        $opStaff = [
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
        ];

        foreach ($opStaff as $info) {
            $user = User::firstOrCreate(
                ['email' => $info['email']],
                [
                    'name' => $info['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles(['staf_operasional']);
        }

        // 3 Admin QC & Stock Opname (Pemeriksa Stok & Barang Rusak)
        $qcStaff = [
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

        foreach ($qcStaff as $info) {
            $user = User::firstOrCreate(
                ['email' => $info['email']],
                [
                    'name' => $info['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles(['admin_qc']);
        }
    }
}
