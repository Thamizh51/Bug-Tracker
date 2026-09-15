<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Bug;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BugController extends Controller
{
    /**
     * Get all bug reports for a particular project
     */
    public function show(Project $project)
    {
        $bugs = $project->bugs()
            ->with(['reporter', 'project'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Project bug reports fetched successfully',
            'project' => $project->name,
            'bugs' => $bugs,
        ]);
    }

    public function store(Request $request, Project $project)
    {

        if (Auth::user()->role !== 'tester') {
            return response()->json([
                'message' => 'Only testers can create bugs.',
            ], 403);
        }

        if ($request->filled('assigned_team')) {
            $request->merge([
                'assigned_team' => ucfirst(strtolower($request->input('assigned_team'))),
            ]);
        }

        $validated = $request->validate([
            'assigned_to' => [
                'nullable',
                'string',
                'max:255',
            ],

            'assigned_team' => [
                'nullable',
                Rule::in(['Frontend', 'Backend']),
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
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

            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'severity' => [
                'nullable',
                Rule::in(['low', 'medium', 'high', 'critical']),
            ],

            'priority' => [
                'nullable',
                Rule::in(['low', 'medium', 'high', 'critical']),
            ],
        ]);

        if ($project->status !== 'active') {
            return response()->json([
                'message' => 'You cannot report a bug for an inactive project.',
            ], 422);
        }

        // Store uploaded image
        if ($request->hasFile('image')) {
            $validated['image'] = $request
                ->file('image')
                ->store('bugs', 'public');
        }

        $bug = Bug::create([
            'project_id' => $project->id,
            'reported_by' => Auth::user()->name,

            // Tester submits only bug details
            'assigned_to' => $validated['assigned_to'] ?? null,
            'assigned_team' => $validated['assigned_team'] ?? null,

            'title' => $validated['title'],
            'description' => $validated['description'],
            'expected_result' => $validated['expected_result'] ?? null,
            'actual_result' => $validated['actual_result'] ?? null,
            'image' => $validated['image'] ?? null,

            'severity' => $validated['severity'] ?? 'medium',
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
        ]);
        $bug->load(['project', 'reporter']);
        return response()->json([
            'message' => 'Bug created successfully by tester.',
            'bug' => $bug,
        ], 201);
    }

    public function updateStatus(Request $request, Bug $bug)
    {
        // Check if the user is logged in
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Only developers can update bug status
        if (Auth::user()->role !== 'developer') {
            return response()->json([
                'message' => 'Only developers can update bug status.',
            ], 403);
        }

        // Validate the new status
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'in_progress',
                    'resolved',
                ]),
            ],
        ]);

        // Update the bug status
        $bug->status = $validated['status'];

        // Set resolved_at when the bug is resolved
        if ($validated['status'] === 'resolved') {
            $bug->resolved_at = now();
        } else {
            $bug->resolved_at = null;
        }

        $bug->save();

        // Load related project and reporter
        $bug->load(['project', 'reporter']);

        return response()->json([
            'message' => 'Bug status updated successfully.',
            'bug' => $bug,
        ], 200);
    }
    public function assignedBugs()
    {
        $user = Auth::user();

        if ($user->role !== 'developer') {
            return response()->json([
                'message' => 'Only developers can view assigned bugs.',
            ], 403);
        }

        $bugs = Bug::where('assigned_to', $user->name)
            ->with('project:id,name')
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Assigned bugs fetched successfully.',
            'total_bugs' => $bugs->total(),
            'bugs' => $bugs->items(),
            'pagination' => [
                'current_page' => $bugs->currentPage(),
                'per_page' => $bugs->perPage(),
                'last_page' => $bugs->lastPage(),
            ],
        ]);
    }
    /**
 * Update a bug report created by the logged-in tester
 */
public function update(Request $request, Bug $bug)
{
    $user = Auth::user();

    // Only testers can modify bugs
    if ($user->role !== 'tester') {
        return response()->json([
            'message' => 'Only testers can modify bugs.',
        ], 403);
    }

    // Only the tester who reported the bug can modify it
    if ($bug->reported_by !== $user->name) {
        return response()->json([
            'message' => 'You can only modify your own bug reports.',
        ], 403);
    }

    // Optional: prevent modifying resolved bugs
    if ($bug->status === 'resolved') {
        return response()->json([
            'message' => 'Resolved bugs cannot be modified.',
        ], 422);
    }

    if ($request->filled('assigned_team')) {
        $request->merge([
            'assigned_team' => ucfirst(strtolower($request->input('assigned_team'))),
        ]);
    }

    $validated = $request->validate([
        'assigned_to' => [
            'nullable',
            'string',
            'max:255',
        ],

        'assigned_team' => [
            'nullable',
            Rule::in(['Frontend', 'Backend']),
        ],

        'title' => [
            'sometimes',
            'string',
            'max:255',
        ],

        'description' => [
            'sometimes',
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

        'image' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
        ],

        'severity' => [
            'nullable',
            Rule::in(['low', 'medium', 'high', 'critical']),
        ],

        'priority' => [
            'nullable',
            Rule::in(['low', 'medium', 'high', 'critical']),
        ],
    ]);

    // Store new image
    if ($request->hasFile('image')) {
        $validated['image'] = $request
            ->file('image')
            ->store('bugs', 'public');
    }

    $bug->update($validated);

    $bug->load(['project', 'reporter']);

    return response()->json([
        'message' => 'Bug updated successfully.',
        'bug' => $bug,
    ], 200);
}
/**
 * Delete a bug report created by the logged-in tester
 */
public function destroy(Bug $bug)
{
    $user = Auth::user();

    // Only testers can delete bugs
    if ($user->role !== 'tester') {
        return response()->json([
            'message' => 'Only testers can delete bugs.',
        ], 403);
    }

    // Only the tester who reported the bug can delete it
    if ($bug->reported_by !== $user->name) {
        return response()->json([
            'message' => 'You can only delete your own bug reports.',
        ], 403);
    }

    // Optional: prevent deleting resolved bugs
    if ($bug->status === 'resolved') {
        return response()->json([
            'message' => 'Resolved bugs cannot be deleted.',
        ], 422);
    }

    $bug->delete();

    return response()->json([
        'message' => 'Bug deleted successfully.',
    ], 200);
}
public function singleBug(Bug $bug)
{
    $bug->load([
        'project',
        'reporter',
    ]);

    return response()->json([
        'message' => 'Bug fetched successfully.',
        'bug' => $bug,
    ], 200);
}
}
