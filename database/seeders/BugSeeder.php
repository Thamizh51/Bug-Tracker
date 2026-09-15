<?php

namespace Database\Seeders;

use App\Models\Bug;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class BugSeeder extends Seeder
{
    public function run(): void
    {
        $project = Project::first();

        if (!$project) {
            $this->command->error(
                'No project found. Please create a project first.'
            );

            return;
        }

        $tester = User::where('role', 'tester')->first();
        $developer = User::where('role', 'developer')->first();

        if (!$tester) {
            $this->command->error(
                'No tester found. Please create a tester user first.'
            );

            return;
        }

        $developerName = $developer?->name;

        Bug::create([
            'project_id' => $project->id,
            'reported_by' => $tester->name,
            'assigned_to' => $developerName,
            'assigned_team' => 'Frontend',
            'title' => 'Login button is not working',
            'description' => 'The login button does not submit the login form.',
            'expected_result' => 'The user should be logged in successfully.',
            'actual_result' => 'The login button does not respond after clicking.',
            'image' => null,
            'url' => 'https://example.com/login',
            'severity' => 'high',
            'priority' => 'high',
            'status' => 'open',
        ]);

        Bug::create([
            'project_id' => $project->id,
            'reported_by' => $tester->name,
            'assigned_to' => $developerName,
            'assigned_team' => 'Backend',
            'title' => 'User API returns server error',
            'description' => 'The user API returns a 500 error for valid requests.',
            'expected_result' => 'The API should return user details with status 200.',
            'actual_result' => 'The API returns status 500.',
            'image' => null,
            'url' => 'https://example.com/api/users',
            'severity' => 'critical',
            'priority' => 'urgent',
            'status' => 'in_progress',
        ]);

        Bug::create([
            'project_id' => $project->id,
            'reported_by' => $tester->name,
            'assigned_to' => $developerName,
            'assigned_team' => 'Frontend',
            'title' => 'Dashboard layout breaks on mobile',
            'description' => 'The dashboard content overflows on small screens.',
            'expected_result' => 'The dashboard should be responsive on mobile devices.',
            'actual_result' => 'The page content extends outside the screen.',
            'image' => null,
            'url' => 'https://example.com/dashboard',
            'severity' => 'medium',
            'priority' => 'medium',
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        Bug::create([
            'project_id' => $project->id,
            'reported_by' => $tester->name,
            'assigned_to' => null,
            'assigned_team' => null,
            'title' => 'Incorrect validation message',
            'description' => 'The email validation message is not displayed correctly.',
            'expected_result' => 'A clear validation message should be displayed.',
            'actual_result' => 'The validation message is missing.',
            'image' => null,
            'url' => 'https://example.com/register',
            'severity' => 'low',
            'priority' => 'low',
            'status' => 'reopened',
        ]);

        $this->command->info('Sample bugs created successfully.');
    }
}