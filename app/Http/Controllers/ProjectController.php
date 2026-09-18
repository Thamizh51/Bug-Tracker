<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    /**
     * Check admin access.
     */
    private function checkAdmin()
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only admin can perform this action.',
            ], 403);
        }

        return null;
    }

    /**
     * Fetch all projects.
     */
    public function show()
    {
        $projects = Project::with('creator:id,name')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Projects fetched successfully.',
            'projects' => $projects,
        ]);
    }

    /**
     * Create project - Admin only.
     */
    public function store(Request $request)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:projects,name',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'active',
                    'finished',
                    'onhold',
                    'archieved',
                ]),
            ],
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'created_by' => Auth::id(),
        ]);

        $project->load('creator:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully.',
            'project' => $project,
        ], 201);
    }

    /**
     * Update project details - Admin only.
     */
    public function update(Request $request, Project $project)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'name')
                    ->ignore($project->id),
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ]);

        $project->update($validated);

        $project->load('creator:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully.',
            'project' => $project,
        ]);
    }

    /**
     * Update project status - Admin only.
     */
    public function updateStatus(Request $request, Project $project)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'active',
                    'finished',
                    'onhold',
                    'archived',
                ]),
            ],
        ]);

        $project->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project status updated successfully.',
            'project' => $project,
        ]);
    }

    /**
     * Delete project - Admin only.
     */
    public function destroy(Project $project)
    {
        if ($response = $this->checkAdmin()) {
            return $response;
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully.',
        ]);
    }
}
