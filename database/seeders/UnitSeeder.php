<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'Pcs', 'short_name' => 'pcs'],
            ['name' => 'Set', 'short_name' => 'set'],
            ['name' => 'Unit', 'short_name' => 'unit'],
            ['name' => 'Pail', 'short_name' => 'pl'],
            ['name' => 'Botol', 'short_name' => 'btl'],
        ];

        foreach ($units as $unit) {
            Unit::firstOrCreate(
                ['name' => $unit['name']],
                ['short_name' => $unit['short_name']]
            );
        }
    }
}
