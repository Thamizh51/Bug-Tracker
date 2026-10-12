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
        User::firstOrCreate(
            ['email' => 'admin@bugtracker.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'department' => null,
            ]
        );

        // Backend Developer - Mohan
        User::firstOrCreate(
            ['email' => 'mohan@bugtracker.com'],
            [
                'name' => 'Mohan',
                'password' => Hash::make('password123'),
                'role' => 'developer',
                'department' => 'backend',
            ]
        );

        // Backend Developer - Selvam
        User::firstOrCreate(
            ['email' => 'selvam@bugtracker.com'],
            [
                'name' => 'Selvam',
                'password' => Hash::make('password123'),
                'role' => 'developer',
                'department' => 'backend',
            ]
        );

        // Frontend Developer - Murali
        User::firstOrCreate(
            ['email' => 'murali@bugtracker.com'],
            [
                'name' => 'Murali',
                'password' => Hash::make('password123'),
                'role' => 'developer',
                'department' => 'frontend',
            ]
        );

        // Frontend Developer - Seetha
        User::firstOrCreate(
            ['email' => 'seetha@bugtracker.com'],
            [
                'name' => 'Seetha',
                'password' => Hash::make('password123'),
                'role' => 'developer',
                'department' => 'frontend',
            ]
        );

        // QA Tester - Tester
        User::firstOrCreate(
            ['email' => 'tester@bugtracker.com'],
            [
                'name' => 'Tester',
                'password' => Hash::make('password123'),
                'role' => 'tester',
                'department' => null,
            ]
        );
    }
}