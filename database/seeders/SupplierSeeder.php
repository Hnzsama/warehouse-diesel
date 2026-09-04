<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'code' => 'SUP-001',
                'name' => 'PT Kencana Diesel Parts',
                'phone' => '061-4512098',
                'email' => 'sales@kencanadiesel.co.id',
                'address' => 'Jl. Krakatau No. 45, Medan',
                'notes' => 'Distributor utama sparepart Fuso & Hino',
            ],
            [
                'code' => 'SUP-002',
                'name' => 'CV Sinar Jaya Motor Medan',
                'phone' => '061-6623101',
                'email' => 'sinarjayamotor@gmail.com',
                'address' => 'Jl. Asia No. 128, Medan',
                'notes' => 'Supplier suku cadang Canter & Isuzu Panther',
            ],
            [
                'code' => 'SUP-003',
                'name' => 'PT Distributor Sparepart Sumatra',
                'phone' => '061-7365920',
                'email' => 'info@dss-parts.com',
                'address' => 'Kawasan Industri Medan (KIM) II, Deli Serdang',
                'notes' => 'Pemasok oli drum, filter, dan baut heavy duty',
            ],
            [
                'code' => 'SUP-004',
                'name' => 'Toko Berkah Diesel Pulo Brayan',
                'phone' => '0812-6019-8877',
                'email' => 'berkahdiesel.medan@yahoo.com',
                'address' => 'Jl. Pertempuran No. 12, Pulo Brayan, Medan',
                'notes' => 'Spesialis injector diesel & nozzle original',
            ],
            [
                'code' => 'SUP-005',
                'name' => 'PT Central Auto Parts',
                'phone' => '061-4158900',
                'email' => 'order@centralautoparts.id',
                'address' => 'Jl. Gatot Subroto No. 88, Medan',
                'notes' => 'Distributor kampas rem & sistem pengapian truk',
            ],
        ];

        foreach ($suppliers as $data) {
            Supplier::firstOrCreate(
                ['code' => $data['code']],
                $data
            );
        }
    }
}
