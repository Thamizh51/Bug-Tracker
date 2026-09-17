<?php

namespace App\Http\Controllers;

use App\Models\Bug;
use App\Models\Project;
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
            ->with([
                'project',
                'reporter',
            ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Project bug reports fetched successfully.',
            'project' => $project->name,
            'bugs' => $bugs,
        ], 200);
    }

    /**
     * Convert developer ID to developer name.
     */
    private function getDeveloperName(?int $developerId): ?string
    {
        if ($developerId === null) {
            return null;
        }

        $developer = User::query()
            ->where('id', $developerId)
            ->where('role', 'developer')
            ->first();

        if (!$developer) {
            abort(response()->json([
                'success' => false,
                'message' => 'Invalid developer ID.',
            ], 422));
        }

        return $developer->name;
    }

    /**
     * Create a bug - Tester only.
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

        if ($user->role !== 'tester') {
            return response()->json([
                'success' => false,
                'message' => 'Only testers can create bugs.',
            ], 403);
        }

        if ($project->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'You cannot report a bug for an inactive project.',
            ], 422);
        }

        $validated = $request->validate([
            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'assigned_team' => [
                'nullable',
                Rule::in([
                    'frontend',
                    'backend',
                    'seo',
                    'devops',
                ]),
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
                'max:2000',
            ],

            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'severity' => [
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'critical',
                ]),
            ],

            'priority' => [
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],
        ]);

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

            'status' => 'assigned',
        ]);

        $bug->load([
            'project',
            'reporter',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bug created successfully by tester.',
            'bug' => $bug,
        ], 201);
    }

    /**
     * Developer updates bug status.
     *
     * Developer allowed statuses:
     * assigned, pending, in_progress, resolved
     */
    public function updateStatus(Request $request, Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'developer') {
            return response()->json([
                'success' => false,
                'message' => 'Only developers can update bug status.',
            ], 403);
        }

        if ($bug->assigned_to !== $user->name) {
            return response()->json([
                'success' => false,
                'message' => 'This bug is not assigned to you.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'assigned',
                    'pending',
                    'in_progress',
                    'resolved',
                ]),
            ],
        ]);

        $newStatus = $validated['status'];

        $bug->status = $newStatus;

        if ($newStatus === 'resolved') {
            $bug->resolved_at = now();
        } else {
            $bug->resolved_at = null;
        }

        $bug->save();

        $bug->load([
            'project',
            'reporter',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bug status updated successfully.',
            'bug' => $bug,
        ], 200);
    }

    /**
     * Tester retests a resolved bug.
     *
     * Allowed changes:
     * resolved -> reopened
     * resolved -> closed
     */
    public function retest(Request $request, Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'success' => false,
                'message' => 'Only testers can retest bugs.',
            ], 403);
        }

        if ($bug->status !== 'resolved') {
            return response()->json([
                'success' => false,
                'message' => 'Only resolved bugs can be retested.',
            ], 422);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'reopened',
                    'closed',
                ]),
            ],
        ]);

        $newStatus = $validated['status'];

        $bug->status = $newStatus;

        if ($newStatus === 'reopened') {
            $bug->resolved_at = null;
        }

        $bug->save();

        $bug->load([
            'project',
            'reporter',
        ]);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'closed'
                ? 'Bug retested and closed successfully.'
                : 'Bug reopened successfully.',
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
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'developer') {
            return response()->json([
                'success' => false,
                'message' => 'Only developers can view assigned bugs.',
            ], 403);
        }

        $bugs = Bug::where('assigned_to', $user->name)
            ->with([
                'project:id,name',
                'reporter:id,name,email',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Assigned bugs fetched successfully.',
            'total_bugs' => $bugs->total(),
            'bugs' => $bugs->items(),
            'pagination' => [
                'current_page' => $bugs->currentPage(),
                'per_page' => $bugs->perPage(),
                'last_page' => $bugs->lastPage(),
                'total' => $bugs->total(),
            ],
        ], 200);
    }

    /**
     * Update a bug - Tester only.
     */
    public function update(Request $request, Bug $bug)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'success' => false,
                'message' => 'Only testers can modify bugs.',
            ], 403);
        }
 

        if (in_array($bug->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Resolved or closed bugs cannot be modified.',
            ], 422);
        }

        $validated = $request->validate([
            'assigned_to' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'assigned_team' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'frontend',
                    'backend',
                    'seo',
                    'devops',
                ]),
            ],

            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'sometimes',
                'required',
                'string',
            ],

            'expected_result' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'actual_result' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'url' => [
                'sometimes',
                'nullable',
                'url',
                'max:2000',
            ],

            'image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'severity' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'critical',
                ]),
            ],

            'priority' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],
        ]);

        if (array_key_exists('assigned_to', $validated)) {
            $validated['assigned_to'] = $this->getDeveloperName(
                $validated['assigned_to']
            );

            // Reassigning the bug sends it back to assigned status.
            $validated['status'] = 'assigned';
        }

        if ($request->hasFile('image')) {
            if (
                $bug->image &&
                Storage::disk('public')->exists($bug->image)
            ) {
                Storage::disk('public')->delete($bug->image);
            }

            $validated['image'] = $request
                ->file('image')
                ->store('bugs', 'public');
        }

        $bug->update($validated);

        $bug->load([
            'project',
            'reporter',
        ]);

        return response()->json([
            'success' => true,
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
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'tester') {
            return response()->json([
                'success' => false,
                'message' => 'Only testers can delete bugs.',
            ], 403);
        }

        if ($bug->reported_by !== $user->name) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own bug reports.',
            ], 403);
        }

        if (in_array($bug->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Resolved or closed bugs cannot be deleted.',
            ], 422);
        }

        if (
            $bug->image &&
            Storage::disk('public')->exists($bug->image)
        ) {
            Storage::disk('public')->delete($bug->image);
        }

        $bug->delete();

        return response()->json([
            'success' => true,
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
            'success' => true,
            'message' => 'Bug fetched successfully.',
            'bug' => $bug,
        ], 200);
    }
}