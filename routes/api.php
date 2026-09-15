<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\BugController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout']);

    Route::post('/admin/users', [UserController::class, 'store']);
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);

    Route::get('/admin/developers', [UserController::class, 'developers']);

    // Project Routes

    // Fetch all projects
    Route::get('/projects', [ProjectController::class, 'show']);

    // Create a new project
    Route::post('/create-project', [ProjectController::class, 'store']);

    // Update an existing project
    Route::put('/projects/{project}', [ProjectController::class, 'update']);

    // Update project status (Admin only)
    Route::patch('/projects/{project}/status',[ProjectController::class, 'updateStatus']);

    // Delete a project
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Bug Routes

    // Fetch all bugs for a specific project
    Route::get('/projects/{project}/bugs', [BugController::class, 'show']);

    // Create a new bug for a specific project
    Route::post('/projects/{project}/create-bug', [BugController::class, 'store']);

    // Update the status of a specific bug
    Route::put('/bugs/{bug}/status', [BugController::class, 'updateStatus']);

    // Fetch all bugs assigned to the logged-in developer
    Route::get('/developer/assigned-bugs', [BugController::class, 'assignedBugs']);

    // Views A Single Bug
    Route::get('/bugs/{bug}', [BugController::class, 'singleBug']);

    // Tester modifies a bug
    Route::put('/bugs/{bug}', [BugController::class, 'update']);

    // Tester deletes a bug
    Route::delete('/bugs/{bug}', [BugController::class, 'destroy']);
});
