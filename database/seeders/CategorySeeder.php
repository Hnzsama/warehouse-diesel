<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Filter',
            'System Bahan Bakar',
            'Komponen Mesin',
            'Sistem Pengereman',
            'Elektrikal',
            'Sistem Pendingin',
            'Turbo & Exhaust',
            'Transmisi & Propeller',
            'Subspensi & Chassis',
            'Chasis & Bolt',
            'Pelumas',
            'Sabuk Mesin',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );
        }
    }
}
