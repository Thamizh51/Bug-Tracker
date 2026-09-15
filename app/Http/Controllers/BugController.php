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
}
