<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TestCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TestCaseController extends Controller
{
    /**
     * Get all test cases for a specific product/project.
     */
    public function index(Project $project)
    {
        $testCases = $project->testCases()
            ->with(['creator:id,name', 'project:id,name'])
            ->withCount('bugs')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Project test cases fetched successfully.',
            'project' => $project->name,
            'test_cases' => $testCases,
        ], 200);
    }

    /**
     * Get a single test case with all its associated bugs.
     */
    public function show(TestCase $testCase)
    {
        $testCase->load([
            'project',
            'creator:id,name',
            'bugs' => function ($query) {
                $query->latest();
            },
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test case fetched successfully.',
            'test_case' => $testCase,
        ], 200);
    }

    /**
     * Create a new test case for a project.
     */
    public function store(Request $request, Project $project)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user->role, ['tester', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only testers and admins can create test cases.',
            ], 403);
        }

        $validated = $request->validate([
            'test_case_code' => [
                'nullable',
                'string',
                'max:50',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'module' => [
                'nullable',
                'string',
                'max:100',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'preconditions' => [
                'nullable',
                'string',
            ],
            'steps' => [
                'nullable',
                'string',
            ],
            'expected_result' => [
                'nullable',
                'string',
            ],
            'actual_result' => [
                'nullable',
                'string',
            ],
            'type' => [
                'nullable',
                Rule::in([
                    'functional',
                    'ui',
                    'regression',
                    'smoke',
                    'integration',
                    'performance',
                    'security',
                ]),
            ],
            'priority' => [
                'nullable',
                Rule::in(['urgent', 'high', 'medium', 'low']),
            ],
            'severity' => [
                'nullable',
                Rule::in(['critical', 'high', 'medium', 'low']),
            ],
            'status' => [
                'nullable',
                Rule::in(['pending', 'passed', 'failed', 'blocked', 'in_progress']),
            ],
        ]);

        $testCase = TestCase::create([
            'project_id' => $project->id,
            'test_case_code' => $validated['test_case_code'] ?? null,
            'title' => $validated['title'],
            'module' => $validated['module'] ?? null,
            'description' => $validated['description'] ?? null,
            'preconditions' => $validated['preconditions'] ?? null,
            'steps' => $validated['steps'] ?? null,
            'expected_result' => $validated['expected_result'] ?? null,
            'actual_result' => $validated['actual_result'] ?? null,
            'type' => $validated['type'] ?? 'functional',
            'priority' => $validated['priority'] ?? 'medium',
            'severity' => $validated['severity'] ?? 'medium',
            'status' => $validated['status'] ?? 'pending',
            'created_by' => $user->id,
        ]);

        $testCase->load(['project', 'creator:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Test case created successfully.',
            'test_case' => $testCase,
        ], 201);
    }

    /**
     * Update an existing test case.
     */
    public function update(Request $request, TestCase $testCase)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user->role, ['tester', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only testers and admins can update test cases.',
            ], 403);
        }

        $validated = $request->validate([
            'test_case_code' => ['sometimes', 'nullable', 'string', 'max:50'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'module' => ['sometimes', 'nullable', 'string', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string'],
            'preconditions' => ['sometimes', 'nullable', 'string'],
            'steps' => ['sometimes', 'nullable', 'string'],
            'expected_result' => ['sometimes', 'nullable', 'string'],
            'actual_result' => ['sometimes', 'nullable', 'string'],
            'type' => [
                'sometimes',
                Rule::in([
                    'functional',
                    'ui',
                    'regression',
                    'smoke',
                    'integration',
                    'performance',
                    'security',
                ]),
            ],
            'priority' => [
                'sometimes',
                Rule::in(['urgent', 'high', 'medium', 'low']),
            ],
            'severity' => [
                'sometimes',
                Rule::in(['critical', 'high', 'medium', 'low']),
            ],
            'status' => [
                'sometimes',
                Rule::in(['pending', 'passed', 'failed', 'blocked', 'in_progress']),
            ],
        ]);

        $testCase->update($validated);
        $testCase->load(['project', 'creator:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Test case updated successfully.',
            'test_case' => $testCase,
        ], 200);
    }

    /**
     * Delete a test case.
     */
    public function destroy(TestCase $testCase)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['tester', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $testCase->delete();

        return response()->json([
            'success' => true,
            'message' => 'Test case deleted successfully.',
        ], 200);
    }

    /**
     * Get all bugs belonging to a test case.
     */
    public function bugs(TestCase $testCase)
    {
        $bugs = $testCase->bugs()
            ->with(['project', 'reporter'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Test case bugs fetched successfully.',
            'test_case' => $testCase->title,
            'bugs' => $bugs,
        ], 200);
    }
}
