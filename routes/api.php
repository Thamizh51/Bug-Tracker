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

    // Project Routes
    Route::get('/projects', [ProjectController::class, 'show']);
    Route::post('/create-project', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Bug Routes
    Route::get('/projects/{project}/bugs', [BugController::class, 'show']);
    Route::post('/projects/{project}/create-bug', [BugController::class, 'store']);
    Route::put('/bugs/{bug}/status', [BugController::class, 'updateStatus']);
    Route::get('/developer/assigned-bugs', [BugController::class, 'assignedBugs']);
    Route::get('/bugs/{bug}', [BugController::class, 'singleBug']);
    // Tester modifies a bug
    Route::put('/bugs/{bug}', [BugController::class, 'update']);

    // Tester deletes a bug
    Route::delete('/bugs/{bug}', [BugController::class, 'destroy']);

});
