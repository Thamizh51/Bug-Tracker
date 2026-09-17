<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'department' => null,
        ]);

        // Backend Developer - Mohan
        User::create([
            'name' => 'Mohan',
            'email' => 'mohan@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
            'department' => 'backend',
        ]);

        // Backend Developer - Selvam
        User::create([
            'name' => 'Selvam',
            'email' => 'selvam@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
            'department' => 'backend',
        ]);

        // Frontend Developer - Murali
        User::create([
            'name' => 'Murali',
            'email' => 'murali@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
            'department' => 'frontend',
        ]);

        // Frontend Developer - Seetha
        User::create([
            'name' => 'Seetha',
            'email' => 'seetha@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
            'department' => 'frontend',
        ]);
    }
}