<?php

namespace Database\Seeders;

use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class IncomingItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstWhere('email', 'admin@gudangdiesel.com');
        $items = Item::all();
        $suppliers = Supplier::all();

        if ($items->isEmpty() || ! $admin) {
            return;
        }

        $supplierList = $suppliers->pluck('name')->toArray();
        if (empty($supplierList)) {
            $supplierList = [
                'PT Kencana Diesel Parts',
                'CV Sinar Jaya Motor Medan',
                'PT Distributor Sparepart Sumatra',
                'Toko Berkah Diesel Pulo Brayan',
                'PT Central Auto Parts',
            ];
        }

        $incomingData = [
            // Juli 2026
            [
                'reference_no' => 'IN-20260702-001',
                'date' => '2026-07-02',
                'quantity' => 25,
                'supplier_index' => 0,
                'notes' => 'Pasokan filter solar awal bulan Juli',
            ],
            [
                'reference_no' => 'IN-20260708-002',
                'date' => '2026-07-08',
                'quantity' => 20,
                'supplier_index' => 1,
                'notes' => 'Pengadaan kampas rem depan & belakang Canter',
            ],
            [
                'reference_no' => 'IN-20260715-003',
                'date' => '2026-07-15',
                'quantity' => 30,
                'supplier_index' => 2,
                'notes' => 'Restok drum oli mesin SAE 15W-40',
            ],
            [
                'reference_no' => 'IN-20260722-004',
                'date' => '2026-07-22',
                'quantity' => 15,
                'supplier_index' => 3,
                'notes' => 'Penerimaan piston kit Hino Duty',
            ],
            [
                'reference_no' => 'IN-20260729-005',
                'date' => '2026-07-29',
                'quantity' => 50,
                'supplier_index' => 4,
                'notes' => 'Restok baut roda belakang kiri & kanan',
            ],
            // Agustus 2026
            [
                'reference_no' => 'IN-20260803-006',
                'date' => '2026-08-03',
                'quantity' => 35,
                'supplier_index' => 0,
                'notes' => 'Restok filter oli Canter & Fuso Hino',
            ],
            [
                'reference_no' => 'IN-20260810-007',
                'date' => '2026-08-10',
                'quantity' => 8,
                'supplier_index' => 1,
                'notes' => 'Pengadaan dynamo starter Hino 500 FM',
            ],
            [
                'reference_no' => 'IN-20260817-008',
                'date' => '2026-08-17',
                'quantity' => 18,
                'supplier_index' => 2,
                'notes' => 'Pasokan cross joint kopling Fuso FM517',
            ],
            [
                'reference_no' => 'IN-20260824-009',
                'date' => '2026-08-24',
                'quantity' => 20,
                'supplier_index' => 3,
                'notes' => 'Penerimaan nozzle injector diesel Canter',
            ],
            [
                'reference_no' => 'IN-20260830-010',
                'date' => '2026-08-30',
                'quantity' => 12,
                'supplier_index' => 4,
                'notes' => 'Pengadaan metal duduk standard Hino Duty',
            ],
            // September 2026 (sampai hari ini 03 Sep)
            [
                'reference_no' => 'IN-20260901-011',
                'date' => '2026-09-01',
                'quantity' => 20,
                'supplier_index' => 0,
                'notes' => 'Pasokan rutin filter oli bulanan September',
            ],
            [
                'reference_no' => 'IN-20260902-012',
                'date' => '2026-09-02',
                'quantity' => 10,
                'supplier_index' => 2,
                'notes' => 'Pengadaan nozzle injector truk Canter',
            ],
            [
                'reference_no' => 'IN-20260903-013',
                'date' => '2026-09-03',
                'quantity' => 12,
                'supplier_index' => 4,
                'notes' => 'Pengadaan alternatif dynamo starter Hino 500',
            ],
        ];

        foreach ($incomingData as $index => $data) {
            $item = $items[$index % $items->count()];
            $supplierObj = $suppliers[$data['supplier_index'] % max(1, $suppliers->count())] ?? null;

            IncomingItem::firstOrCreate(
                ['reference_no' => $data['reference_no']],
                [
                    'item_id' => $item->id,
                    'supplier_id' => $supplierObj?->id,
                    'user_id' => $admin->id,
                    'date' => $data['date'],
                    'quantity' => $data['quantity'],
                    'supplier' => $supplierObj?->name ?? 'Supplier',
                    'notes' => $data['notes'],
                ]
            );
        }
    }
}
