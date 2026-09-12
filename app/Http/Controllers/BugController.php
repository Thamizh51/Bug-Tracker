<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class BugController extends Controller
{
    /**
     * Get all bug reports for a particular project
     */
    public function projectBugs(Project $project)
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
}