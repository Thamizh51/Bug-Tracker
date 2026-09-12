<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProjectController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout']);

    Route::post('/admin/users', [UserController::class, 'store']);

    // Project Routes


    // Create project
    Route::post('/projects', [ProjectController::class, 'store']);

    // Update project
    Route::put('/projects/{project}', [ProjectController::class, 'update']);

    // Delete project
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

});