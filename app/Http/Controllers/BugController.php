<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Bug;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BugController extends Controller
{
    /**
     * Get all bugs for a particular project.
     */
    public function show(Project $project)
    {
        $bugs = $project->bugs()
            ->with(['reporter'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Project bug reports fetched successfully',
            'project' => $project->name,
            'bugs' => $bugs,
        ]);
    }

    /**
     * Convert developer ID to developer name.
     */
    private function getDeveloperName($developerId)
    {
        if (empty($developerId)) {
            return null;
        }

        $developer = User::where('id', $developerId)
            ->where('role', 'developer')
            ->first();

        if (!$developer) {
            abort(response()->json([
                'message' => 'Invalid developer ID.'
            ], 422));
        }

        return $developer->name;
    }

    /**
     * Create a bug - Tester only.
     * Image is required.
     */
    public function store(Request $request, Project $project)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'message' => 'Only testers can create bugs.',
            ], 403);
        }

        if ($request->filled('assigned_team')) {
            $request->merge([
                'assigned_team' => ucfirst(
                    strtolower($request->input('assigned_team'))
                ),
            ]);
        }

        $validated = $request->validate([
            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
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

            'url' => [
                'nullable',
                'url',
                'max:2048',
            ],

            'image' => [
                'required',
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

        // Convert developer ID to developer name.
        $assignedToName = $this->getDeveloperName(
            $validated['assigned_to'] ?? null
        );

        $imagePath = $request
            ->file('image')
            ->store('bugs', 'public');

        $bug = Bug::create([
            'project_id' => $project->id,
            'reported_by' => $user->name,

            'assigned_to' => $assignedToName,
            'assigned_team' => $validated['assigned_team'] ?? null,

            'title' => $validated['title'],
            'description' => $validated['description'],
            'expected_result' => $validated['expected_result'] ?? null,
            'actual_result' => $validated['actual_result'] ?? null,

            'url' => $validated['url'] ?? null,
            'image' => $imagePath,

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

    /**
     * Update bug status - Developer only.
     */
    public function updateStatus(Request $request, Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'developer') {
            return response()->json([
                'message' => 'Only developers can update bug status.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'open',
                    'assigned',
                    'in_progress',
                    'resolved',
                    'reopened',
                    'pending',
                ]),
            ],
        ]);

        $bug->status = $validated['status'];

        if ($validated['status'] === 'resolved') {
            $bug->resolved_at = now();
        } else {
            $bug->resolved_at = null;
        }

        $bug->save();

        $bug->load(['project', 'reporter']);

        return response()->json([
            'message' => 'Bug status updated successfully.',
            'bug' => $bug,
        ], 200);
    }

    /**
     * Get bugs assigned to the logged-in developer.
     */
    public function assignedBugs()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

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
     * Update a bug - Tester only.
     */
    public function update(Request $request, Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'message' => 'Only testers can modify bugs.',
            ], 403);
        }

        if ($bug->reported_by !== $user->name) {
            return response()->json([
                'message' => 'You can only modify your own bug reports.',
            ], 403);
        }

        if ($bug->status === 'resolved') {
            return response()->json([
                'message' => 'Resolved bugs cannot be modified.',
            ], 422);
        }

        if ($request->filled('assigned_team')) {
            $request->merge([
                'assigned_team' => ucfirst(
                    strtolower($request->input('assigned_team'))
                ),
            ]);
        }

        $validated = $request->validate([
            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
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

            'url' => [
                'nullable',
                'url',
                'max:2048',
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

        // Convert developer ID to developer name.
        if (array_key_exists('assigned_to', $validated)) {
            $validated['assigned_to'] = $this->getDeveloperName(
                $validated['assigned_to']
            );
        }

        if ($request->hasFile('image')) {
            if ($bug->image && Storage::disk('public')->exists($bug->image)) {
                Storage::disk('public')->delete($bug->image);
            }

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
     * Delete a bug - Tester only.
     */
    public function destroy(Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'message' => 'Only testers can delete bugs.',
            ], 403);
        }

        if ($bug->reported_by !== $user->name) {
            return response()->json([
                'message' => 'You can only delete your own bug reports.',
            ], 403);
        }

        if ($bug->status === 'resolved') {
            return response()->json([
                'message' => 'Resolved bugs cannot be deleted.',
            ], 422);
        }

        if ($bug->image && Storage::disk('public')->exists($bug->image)) {
            Storage::disk('public')->delete($bug->image);
        }

        $bug->delete();

        return response()->json([
            'message' => 'Bug deleted successfully.',
        ], 200);
    }

    /**
     * Get a single bug.
     */
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