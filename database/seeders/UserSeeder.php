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
        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Developer 1
        User::create([
            'name' => 'John Developer',
            'email' => 'developer1@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
        ]);

        // Developer 2
        User::create([
            'name' => 'David Developer',
            'email' => 'developer2@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'developer',
        ]);

        // Tester 1
        User::create([
            'name' => 'Test User',
            'email' => 'tester1@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'tester',
        ]);

        // Tester 2
        User::create([
            'name' => 'Sarah Tester',
            'email' => 'tester2@bugtracker.com',
            'password' => Hash::make('password123'),
            'role' => 'tester',
        ]);
    }
}

