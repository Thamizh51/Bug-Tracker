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
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Bug Routes
    Route::get('/projects/{project}/bugs', [BugController::class, 'show']);
    Route::post('/projects/{project}/bugs', [BugController::class, 'store']);
});
