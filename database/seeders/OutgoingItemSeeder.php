<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\OutgoingItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class OutgoingItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstWhere('email', 'admin@gudangdiesel.com');
        $items = Item::all();

        if ($items->isEmpty() || ! $admin) {
            return;
        }

        $recipients = [
            'Truk Hino 500 BK 8892 AB',
            'Truk Mitsubishi Fuso BK 9102 CD',
            'Mekanik Pak Joko (Servis Rutin)',
            'Truk Canter HDX BK 7711 EF',
            'Unit Truk Tronton Hino Duty BK 8000 XY',
        ];

        $outgoingData = [
            // Juli 2026
            [
                'reference_no' => 'OUT-20260703-001',
                'date' => '2026-07-03',
                'quantity' => 2,
                'recipient' => $recipients[0],
                'notes' => 'Pengantian filter oli servis berkala 10.000 KM',
            ],
            [
                'reference_no' => 'OUT-20260710-002',
                'date' => '2026-07-10',
                'quantity' => 4,
                'recipient' => $recipients[1],
                'notes' => 'Pengantian kampas rem roda depan',
            ],
            [
                'reference_no' => 'OUT-20260718-003',
                'date' => '2026-07-18',
                'quantity' => 1,
                'recipient' => $recipients[2],
                'notes' => 'Pengambilan perbaikan nozzle injector',
            ],
            [
                'reference_no' => 'OUT-20260725-004',
                'date' => '2026-07-25',
                'quantity' => 3,
                'recipient' => $recipients[3],
                'notes' => 'Pengantian oli mesin galon 20L Canter',
            ],
            // Agustus 2026
            [
                'reference_no' => 'OUT-20260804-005',
                'date' => '2026-08-04',
                'quantity' => 10,
                'recipient' => $recipients[4],
                'notes' => 'Pengantian baut roda patah Hino Duty',
            ],
            [
                'reference_no' => 'OUT-20260812-006',
                'date' => '2026-08-12',
                'quantity' => 1,
                'recipient' => $recipients[0],
                'notes' => 'Ganti starter motor rusak',
            ],
            [
                'reference_no' => 'OUT-20260820-007',
                'date' => '2026-08-20',
                'quantity' => 2,
                'recipient' => $recipients[1],
                'notes' => 'Servis filter udara Fuso Fighter',
            ],
            [
                'reference_no' => 'OUT-20260828-008',
                'date' => '2026-08-28',
                'quantity' => 1,
                'recipient' => $recipients[2],
                'notes' => 'Ganti cross joint kopling macet',
            ],
            // September 2026 (sampai hari ini 03 Sep)
            [
                'reference_no' => 'OUT-20260901-009',
                'date' => '2026-09-01',
                'quantity' => 2,
                'recipient' => $recipients[0],
                'notes' => 'Pengantian filter oli servis berkala 10.000 KM',
            ],
            [
                'reference_no' => 'OUT-20260902-010',
                'date' => '2026-09-02',
                'quantity' => 3,
                'recipient' => $recipients[3],
                'notes' => 'Pengantian oli mesin galon 20L',
            ],
            [
                'reference_no' => 'OUT-20260903-011',
                'date' => '2026-09-03',
                'quantity' => 1,
                'recipient' => $recipients[4],
                'notes' => 'Ganti starter motor rusak',
            ],
        ];

        foreach ($outgoingData as $index => $data) {
            $item = $items[$index % $items->count()];

            OutgoingItem::firstOrCreate(
                ['reference_no' => $data['reference_no']],
                [
                    'item_id' => $item->id,
                    'user_id' => $admin->id,
                    'date' => $data['date'],
                    'quantity' => $data['quantity'],
                    'recipient' => $data['recipient'],
                    'notes' => $data['notes'],
                ]
            );
        }
    }
}
