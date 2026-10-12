<?php

namespace Tests\Feature;

use App\Models\Bug;
use App\Models\Project;
use App\Models\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase as BaseTestCase;

class TestCaseBugRelationshipTest extends BaseTestCase
{
    public function test_product_has_multiple_test_cases_and_each_test_case_has_multiple_bugs(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin_test@bugtracker.com'],
            ['name' => 'Admin Test', 'password' => bcrypt('password'), 'role' => 'admin']
        );

        $project = Project::create([
            'name' => 'Automated Test Product',
            'description' => 'Product for verifying test case and bug relationships',
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        $testCase1 = TestCase::create([
            'project_id' => $project->id,
            'test_case_code' => 'TC-ATP-001',
            'title' => 'Verify user authentication login flow',
            'module' => 'Auth',
            'type' => 'functional',
            'priority' => 'high',
            'severity' => 'high',
            'status' => 'failed',
            'created_by' => $admin->id,
        ]);

        $testCase2 = TestCase::create([
            'project_id' => $project->id,
            'test_case_code' => 'TC-ATP-002',
            'title' => 'Verify checkout payment processing',
            'module' => 'Checkout',
            'type' => 'functional',
            'priority' => 'urgent',
            'severity' => 'critical',
            'status' => 'failed',
            'created_by' => $admin->id,
        ]);

        $bug1 = Bug::create([
            'project_id' => $project->id,
            'test_case_id' => $testCase1->id,
            'reported_by' => $admin->name,
            'title' => 'Invalid password format crashes login controller',
            'description' => 'Bug 1 for test case 1',
            'severity' => 'high',
            'priority' => 'high',
            'status' => 'assigned',
        ]);

        $bug2 = Bug::create([
            'project_id' => $project->id,
            'test_case_id' => $testCase1->id,
            'reported_by' => $admin->name,
            'title' => 'Remember Me checkbox cookie is not persisted',
            'description' => 'Bug 2 for test case 1',
            'severity' => 'medium',
            'priority' => 'medium',
            'status' => 'in_progress',
        ]);

        $bug3 = Bug::create([
            'project_id' => $project->id,
            'test_case_id' => $testCase2->id,
            'reported_by' => $admin->name,
            'title' => 'Stripe 3DS modal does not appear on Safari',
            'description' => 'Bug 1 for test case 2',
            'severity' => 'critical',
            'priority' => 'urgent',
            'status' => 'assigned',
        ]);

        $bug4 = Bug::create([
            'project_id' => $project->id,
            'test_case_id' => $testCase2->id,
            'reported_by' => $admin->name,
            'title' => 'Coupon code discount calculation rounds wrongly',
            'description' => 'Bug 2 for test case 2',
            'severity' => 'high',
            'priority' => 'high',
            'status' => 'resolved',
        ]);

        // 1 Project has Multiple Test Cases
        $this->assertCount(2, $project->testCases);

        // Each Test Case has Multiple Bugs
        $this->assertCount(2, $testCase1->bugs);
        $this->assertCount(2, $testCase2->bugs);

        // Bugs point back to correct TestCase & Project
        $this->assertEquals($testCase1->id, $bug1->testCase->id);
        $this->assertEquals($testCase1->id, $bug2->testCase->id);
        $this->assertEquals($testCase2->id, $bug3->testCase->id);
        $this->assertEquals($testCase2->id, $bug4->testCase->id);

        $this->assertEquals($project->id, $bug1->project->id);

        // Clean up test data
        $project->delete(); // Cascades test cases and bugs
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('test_cases', ['id' => $testCase1->id]);
        $this->assertDatabaseMissing('bugs', ['id' => $bug1->id]);
    }
}
