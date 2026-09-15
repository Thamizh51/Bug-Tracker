<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;


class ProjectController extends Controller
{


    public function show()
    {
        $user = Auth::user();

        $projects = Project::latest()->get();

        return response()->json([
            'message' => 'Projects fetched successfully',
            'projects' => $projects,
        ]);
    }
    /**
     * Create a new project
     */
    public function store(Request $request)
    {
        // Only admin can create projects
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can create projects'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:projects,name',
            'description' => 'nullable|string',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }
    /**
     * Update project status (Admin only)
     */
    public function updateStatus(Request $request, Project $project)
    {
        // Only admin can update project status
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can update project status'
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        $project->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Project status updated successfully',
            'project' => $project,
        ]);
    }

    /**
     * Update an existing project
     */
    public function update(Request $request, Project $project)
    {
        // Only admin can update projects
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can update projects'
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'name')->ignore($project->id),
            ],
            'description' => 'sometimes|nullable|string',
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project,
        ]);
    }

    /**
     * Delete a project
     */
    public function destroy(Project $project)
    {
        // Only admin can delete projects
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can delete projects'
            ], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}
