<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('12345678'),
            ]
        );

        $admin->addRole('super_admin');

        $casher = User::firstOrCreate(
            ['email' => 'casher@casher.com'],
            [
                'name' => 'Casher',
                'password' => Hash::make('12345678'),
            ]
        );

        $casher->addRole('casher');
    }
}
