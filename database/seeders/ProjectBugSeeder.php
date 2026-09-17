<?php

namespace Database\Seeders;

use App\Models\Bug;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProjectBugSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Get users
        |--------------------------------------------------------------------------
        */

        $admin = User::where('email', 'admin@bugtracker.com')->first();

        $mohan = User::where('email', 'mohan@bugtracker.com')->first();
        $selvam = User::where('email', 'selvam@bugtracker.com')->first();

        $murali = User::where('email', 'murali@bugtracker.com')->first();
        $seetha = User::where('email', 'seetha@bugtracker.com')->first();

        if (
            !$admin ||
            !$mohan ||
            !$selvam ||
            !$murali ||
            !$seetha
        ) {
            throw new \Exception(
                'Required users are missing. Check UserSeeder email addresses.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Project data
        |--------------------------------------------------------------------------
        */

        $projects = [
            [
                'name' => 'AI Prep',
                'description' => 'AI-based interview preparation platform.',
            ],
            [
                'name' => 'Resume Analyzer',
                'description' => 'Application for analyzing resumes and ATS scores.',
            ],
            [
                'name' => 'E-Commerce Platform',
                'description' => 'Online shopping and product management platform.',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Bug data
        |--------------------------------------------------------------------------
        */

        $bugTemplates = [
            [
                'title' => 'Login button is not working',
                'description' => 'The login button does not submit the login form.',
                'expected_result' => 'User should be logged in successfully.',
                'actual_result' => 'Nothing happens after clicking the login button.',
                'severity' => 'high',
                'priority' => 'high',
                'assigned_team' => 'frontend',
                'assigned_to' => $murali->name,
                'status' => 'assigned',
            ],
            [
                'title' => 'Invalid email validation missing',
                'description' => 'The application accepts invalid email formats.',
                'expected_result' => 'Invalid email formats should show a validation message.',
                'actual_result' => 'The form accepts invalid email addresses.',
                'severity' => 'medium',
                'priority' => 'medium',
                'assigned_team' => 'frontend',
                'assigned_to' => $seetha->name,
                'status' => 'pending',
            ],
            [
                'title' => 'API returns HTTP 500 error',
                'description' => 'The user API returns an internal server error.',
                'expected_result' => 'The API should return valid user data.',
                'actual_result' => 'The API returns HTTP 500.',
                'severity' => 'critical',
                'priority' => 'urgent',
                'assigned_team' => 'backend',
                'assigned_to' => $mohan->name,
                'status' => 'in_progress',
            ],
            [
                'title' => 'Password reset email not sent',
                'description' => 'Users do not receive password reset emails.',
                'expected_result' => 'Password reset email should be sent.',
                'actual_result' => 'No email is received.',
                'severity' => 'high',
                'priority' => 'high',
                'assigned_team' => 'backend',
                'assigned_to' => $selvam->name,
                'status' => 'assigned',
            ],
            [
                'title' => 'Dashboard cards are misaligned',
                'description' => 'Dashboard cards are not aligned correctly on smaller screens.',
                'expected_result' => 'Dashboard cards should be responsive.',
                'actual_result' => 'Cards overlap on smaller screens.',
                'severity' => 'medium',
                'priority' => 'medium',
                'assigned_team' => 'frontend',
                'assigned_to' => $murali->name,
                'status' => 'in_progress',
            ],
            [
                'title' => 'Project creation fails',
                'description' => 'Admin cannot create a new project.',
                'expected_result' => 'A project should be created successfully.',
                'actual_result' => 'Project creation returns an error.',
                'severity' => 'critical',
                'priority' => 'urgent',
                'assigned_team' => 'backend',
                'assigned_to' => $mohan->name,
                'status' => 'resolved',
            ],
            [
                'title' => 'Bug list pagination is incorrect',
                'description' => 'The bug list displays duplicate records during pagination.',
                'expected_result' => 'Pagination should display unique records.',
                'actual_result' => 'Some records are duplicated.',
                'severity' => 'medium',
                'priority' => 'low',
                'assigned_team' => 'backend',
                'assigned_to' => $selvam->name,
                'status' => 'pending',
            ],
            [
                'title' => 'Mobile menu does not open',
                'description' => 'The mobile navigation menu cannot be opened.',
                'expected_result' => 'The mobile menu should open when clicked.',
                'actual_result' => 'The menu remains closed.',
                'severity' => 'high',
                'priority' => 'high',
                'assigned_team' => 'frontend',
                'assigned_to' => $seetha->name,
                'status' => 'reopened',
            ],
            [
                'title' => 'Search returns incorrect results',
                'description' => 'Searching for a project returns unrelated projects.',
                'expected_result' => 'Search should return matching projects only.',
                'actual_result' => 'Unrelated projects are displayed.',
                'severity' => 'medium',
                'priority' => 'medium',
                'assigned_team' => 'backend',
                'assigned_to' => $mohan->name,
                'status' => 'assigned',
            ],
            [
                'title' => 'Success message is not displayed',
                'description' => 'The success message is missing after saving changes.',
                'expected_result' => 'A success message should be displayed.',
                'actual_result' => 'The data saves but no message appears.',
                'severity' => 'low',
                'priority' => 'low',
                'assigned_team' => 'frontend',
                'assigned_to' => $murali->name,
                'status' => 'resolved',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Create projects and bugs
        |--------------------------------------------------------------------------
        */

        foreach ($projects as $projectData) {
            $project = Project::create([
                'name' => $projectData['name'],
                'description' => $projectData['description'],
                'status' => 'active',
                'created_by' => $admin->id,
            ]);

            foreach ($bugTemplates as $index => $bugData) {
                Bug::create([
                    'project_id' => $project->id,

                    // Admin is used as the sample reporter because
                    // the requested five users do not include a tester.
                    'reported_by' => $admin->name,

                    'assigned_to' => $bugData['assigned_to'],
                    'assigned_team' => $bugData['assigned_team'],

                    'title' => $bugData['title'],
                    'description' => $bugData['description'],
                    'expected_result' => $bugData['expected_result'],
                    'actual_result' => $bugData['actual_result'],

                    'image' => null,

                    'url' => 'https://example.com/' .
                        strtolower(str_replace(' ', '-', $project->name)),

                    'severity' => $bugData['severity'],
                    'priority' => $bugData['priority'],
                    'status' => $bugData['status'],

                    'resolved_at' => in_array(
                        $bugData['status'],
                        ['resolved', 'closed']
                    )
                        ? Carbon::now()
                        : null,

                    'created_at' => Carbon::now()->subDays($index),
                    'updated_at' => Carbon::now()->subDays($index),
                ]);
            }
        }

        $this->command->info(
            '3 projects and 30 bugs created successfully.'
        );
    }
}