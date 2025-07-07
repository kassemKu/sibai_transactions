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
                'name' => 'Alaa',
                'password' => Hash::make('12345678'),
            ]
        );

        $admin->addRole('super_admin');

        $casher = User::firstOrCreate(
            ['email' => 'casher@casher.com'],
            [
                'name' => 'Salah',
                'password' => Hash::make('12345678'),
            ]
        );

        $casher->addRole('casher');
        $user = User::firstOrCreate(
            ['email' => 'user@user.com'],
            [
                'name' => 'Mohamed',
                'password' => Hash::make('12345678'),
            ]
        );

        $user->addRole('casher');
    }
}
