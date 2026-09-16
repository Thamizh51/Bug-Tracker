<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Bug;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectBugSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing users from UserSeeder
        $admin = User::where('email', 'admin@bugtracker.com')->firstOrFail();

        $developer1 = User::where(
            'email',
            'developer1@bugtracker.com'
        )->firstOrFail();

        $developer2 = User::where(
            'email',
            'developer2@bugtracker.com'
        )->firstOrFail();

        $tester1 = User::where(
            'email',
            'tester1@bugtracker.com'
        )->firstOrFail();

        $tester2 = User::where(
            'email',
            'tester2@bugtracker.com'
        )->firstOrFail();

        // Three projects
        $projects = [
            [
                'name' => 'AI Prep',
                'description' => 'AI-powered interview preparation platform.',
                'status' => 'active',
            ],
            [
                'name' => 'Resume Analyzer',
                'description' => 'Application for analyzing resumes and generating ATS scores.',
                'status' => 'active',
            ],
            [
                'name' => 'E-Commerce Platform',
                'description' => 'Online shopping platform with product and order management.',
                'status' => 'active',
            ],
        ];

        $bugData = [
            [
                'title' => 'Login button not working',
                'description' => 'The login button does not submit the form when valid credentials are entered.',
                'expected_result' => 'The user should be logged in and redirected to the dashboard.',
                'actual_result' => 'The button does not respond after clicking.',
                'severity' => 'high',
                'priority' => 'high',
                'status' => 'assigned',
                'assigned_team' => 'frontend',
            ],
            [
                'title' => 'API returns 500 error',
                'description' => 'The project API returns an internal server error for valid requests.',
                'expected_result' => 'The API should return the requested data with HTTP 200.',
                'actual_result' => 'The server returns HTTP 500.',
                'severity' => 'critical',
                'priority' => 'critical',
                'status' => 'in_progress',
                'assigned_team' => 'backend',
            ],
            [
                'title' => 'Dashboard loading slowly',
                'description' => 'The dashboard takes several seconds to load after login.',
                'expected_result' => 'The dashboard should load within a reasonable time.',
                'actual_result' => 'The dashboard takes more than five seconds to load.',
                'severity' => 'medium',
                'priority' => 'medium',
                'status' => 'open',
                'assigned_team' => 'backend',
            ],
            [
                'title' => 'Mobile layout issue',
                'description' => 'Some dashboard elements overlap on mobile screens.',
                'expected_result' => 'All dashboard elements should be responsive.',
                'actual_result' => 'Cards overlap on smaller screens.',
                'severity' => 'medium',
                'priority' => 'high',
                'status' => 'resolved',
                'assigned_team' => 'frontend',
            ],
            [
                'title' => 'Incorrect error message',
                'description' => 'The application displays an incorrect message when an invalid form is submitted.',
                'expected_result' => 'A clear validation error should be displayed.',
                'actual_result' => 'The wrong error message is shown.',
                'severity' => 'low',
                'priority' => 'low',
                'status' => 'reopened',
                'assigned_team' => 'frontend',
            ],
        ];

        foreach ($projects as $projectData) {
            // Create project
            $project = Project::create([
                'name' => $projectData['name'],
                'description' => $projectData['description'],
                'status' => $projectData['status'],
                'created_by' => $admin->id,
            ]);

            // Create 5 bugs for each project
            foreach ($bugData as $index => $data) {
                $developer = $index % 2 === 0
                    ? $developer1
                    : $developer2;

                $tester = $index % 2 === 0
                    ? $tester1
                    : $tester2;

                Bug::create([
                    'project_id' => $project->id,

                    // Your migration uses string reported_by
                    'reported_by' => $tester->name,

                    // Developer name, not developer ID
                    'assigned_to' => $developer->name,

                    'assigned_team' => $data['assigned_team'],

                    'title' => $data['title'] . ' - ' . $project->name,

                    'description' => $data['description'],

                    'expected_result' => $data['expected_result'],

                    'actual_result' => $data['actual_result'],

                    // Placeholder screenshot path
                    'image' => 'bugs/sample-' . ($index + 1) . '.png',

                    'severity' => $data['severity'],

                    'priority' => $data['priority'],

                    'status' => $data['status'],

                    'resolved_at' => $data['status'] === 'resolved'
                        ? now()
                        : null,

                    // Sample URL
                    'url' => 'https://example.com/' . strtolower(
                        str_replace(' ', '-', $project->name)
                    ),

                    'created_at' => now()->subDays($index),

                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('3 projects and 15 bugs created successfully.');
    }
}