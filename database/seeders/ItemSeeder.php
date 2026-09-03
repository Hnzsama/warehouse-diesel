<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'item_code' => 'FLT-DSL-001',
                'name' => 'Filter Oli Canter / Fuso Hino',
                'category' => 'Filter',
                'unit' => 'Pcs',
                'stock' => 45,
                'min_stock' => 10,
                'rack_location' => 'Rak A-01',
            ],
            [
                'item_code' => 'FLT-DSL-002',
                'name' => 'Filter Solar Bawah Canter FE71',
                'category' => 'Filter',
                'unit' => 'Pcs',
                'stock' => 30,
                'min_stock' => 8,
                'rack_location' => 'Rak A-02',
            ],
            [
                'item_code' => 'FLT-DSL-003',
                'name' => 'Filter Udara Outer Hino 500 FM',
                'category' => 'Filter',
                'unit' => 'Set',
                'stock' => 12,
                'min_stock' => 5,
                'rack_location' => 'Rak A-03',
            ],
            [
                'item_code' => 'INJ-DSL-004',
                'name' => 'Nozzle Injector Diesel Canter',
                'category' => 'System Bahan Bakar',
                'unit' => 'Pcs',
                'stock' => 16,
                'min_stock' => 4,
                'rack_location' => 'Rak B-01',
            ],
            [
                'item_code' => 'PST-DSL-005',
                'name' => 'Piston Kit Standard Hino Duty',
                'category' => 'Komponen Mesin',
                'unit' => 'Set',
                'stock' => 8,
                'min_stock' => 2,
                'rack_location' => 'Rak B-02',
            ],
            [
                'item_code' => 'PKG-DSL-006',
                'name' => 'Packing Cylinder Head Fuso 220',
                'category' => 'Komponen Mesin',
                'unit' => 'Set',
                'stock' => 15,
                'min_stock' => 3,
                'rack_location' => 'Rak B-03',
            ],
            [
                'item_code' => 'KMP-DSL-007',
                'name' => 'Kampas Rem Depan Canter HDX',
                'category' => 'Sistem Pengereman',
                'unit' => 'Set',
                'stock' => 24,
                'min_stock' => 6,
                'rack_location' => 'Rak C-01',
            ],
            [
                'item_code' => 'KMP-DSL-008',
                'name' => 'Kampas Rem Belakang Hino FM260',
                'category' => 'Sistem Pengereman',
                'unit' => 'Set',
                'stock' => 18,
                'min_stock' => 6,
                'rack_location' => 'Rak C-02',
            ],
            [
                'item_code' => 'DYN-DSL-009',
                'name' => 'Dynamo Starter 24V Fuso Fighter',
                'category' => 'Elektrikal',
                'unit' => 'Unit',
                'stock' => 5,
                'min_stock' => 2,
                'rack_location' => 'Rak D-01',
            ],
            [
                'item_code' => 'ALT-DSL-010',
                'name' => 'Alternator Asser 24V Hino 500',
                'category' => 'Elektrikal',
                'unit' => 'Unit',
                'stock' => 4,
                'min_stock' => 2,
                'rack_location' => 'Rak D-02',
            ],
            [
                'item_code' => 'WTR-DSL-011',
                'name' => 'Water Pump Assy Canter PS125',
                'category' => 'Sistem Pendingin',
                'unit' => 'Pcs',
                'stock' => 9,
                'min_stock' => 3,
                'rack_location' => 'Rak E-01',
            ],
            [
                'item_code' => 'TRB-DSL-012',
                'name' => 'Turbocharger Assy Hino FM 260TI',
                'category' => 'Turbo & Exhaust',
                'unit' => 'Unit',
                'stock' => 3,
                'min_stock' => 1,
                'rack_location' => 'Rak E-02',
            ],
            [
                'item_code' => 'RNG-DSL-013',
                'name' => 'Ring Piston Standard Canter PS110',
                'category' => 'Komponen Mesin',
                'unit' => 'Set',
                'stock' => 10,
                'min_stock' => 2,
                'rack_location' => 'Rak B-04',
            ],
            [
                'item_code' => 'MTL-DSL-014',
                'name' => 'Metal Jalan Standard Fuso Ganjo',
                'category' => 'Komponen Mesin',
                'unit' => 'Set',
                'stock' => 7,
                'min_stock' => 2,
                'rack_location' => 'Rak B-05',
            ],
            [
                'item_code' => 'MTL-DSL-015',
                'name' => 'Metal Duduk Standard Hino Duty',
                'category' => 'Komponen Mesin',
                'unit' => 'Set',
                'stock' => 6,
                'min_stock' => 2,
                'rack_location' => 'Rak B-06',
            ],
            [
                'item_code' => 'CRS-DSL-016',
                'name' => 'Cross Joint Kopling Fuso FM517',
                'category' => 'Transmisi & Propeller',
                'unit' => 'Pcs',
                'stock' => 22,
                'min_stock' => 5,
                'rack_location' => 'Rak F-01',
            ],
            [
                'item_code' => 'SPG-DSL-017',
                'name' => 'Per Daun Utama Belakang Canter',
                'category' => 'Subspensi & Chassis',
                'unit' => 'Pcs',
                'stock' => 14,
                'min_stock' => 4,
                'rack_location' => 'Area Lantai 1',
            ],
            [
                'item_code' => 'BLT-DSL-018',
                'name' => 'Baut Roda Belakang Kiri Hino 500',
                'category' => 'Chasis & Bolt',
                'unit' => 'Pcs',
                'stock' => 80,
                'min_stock' => 20,
                'rack_location' => 'Rak G-01',
            ],
            [
                'item_code' => 'OIL-DSL-019',
                'name' => 'Oli Mesin Diesel SAE 15W-40 20L',
                'category' => 'Pelumas',
                'unit' => 'Pail',
                'stock' => 18,
                'min_stock' => 5,
                'rack_location' => 'Area Palet A',
            ],
            [
                'item_code' => 'BEL-DSL-020',
                'name' => 'Tali Kipas / Fan Belt Hino 500',
                'category' => 'Sabuk Mesin',
                'unit' => 'Pcs',
                'stock' => 35,
                'min_stock' => 8,
                'rack_location' => 'Rak H-01',
            ],
        ];

        foreach ($items as $data) {
            $category = Category::where('name', $data['category'])->first();
            $unit = Unit::where('name', $data['unit'])->first();

            if ($category && $unit) {
                Item::firstOrCreate(
                    ['item_code' => $data['item_code']],
                    [
                        'name' => $data['name'],
                        'category_id' => $category->id,
                        'unit_id' => $unit->id,
                        'stock' => $data['stock'],
                        'min_stock' => $data['min_stock'],
                        'rack_location' => $data['rack_location'],
                    ]
                );
            }
        }
    }
}
