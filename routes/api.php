<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\BugController;
use App\Http\Controllers\TestCaseController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Admin User Routes
    |--------------------------------------------------------------------------
    */

    Route::post('/admin/users', [UserController::class, 'store']);
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/developers', [UserController::class, 'developers']);
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Project Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/projects', [ProjectController::class, 'show']);

    Route::post('/create-project', [
        ProjectController::class,
        'store',
    ]);

    Route::put('/projects/{project}', [
        ProjectController::class,
        'update',
    ]);

    Route::patch('/projects/{project}/status', [
        ProjectController::class,
        'updateStatus',
    ]);

    Route::delete('/projects/{project}', [
        ProjectController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Test Case Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/projects/{project}/test-cases', [
        TestCaseController::class,
        'index',
    ]);

    Route::post('/projects/{project}/create-test-case', [
        TestCaseController::class,
        'store',
    ]);

    Route::get('/test-cases/{testCase}', [
        TestCaseController::class,
        'show',
    ]);

    Route::put('/test-cases/{testCase}', [
        TestCaseController::class,
        'update',
    ]);

    Route::delete('/test-cases/{testCase}', [
        TestCaseController::class,
        'destroy',
    ]);

    Route::get('/test-cases/{testCase}/bugs', [
        TestCaseController::class,
        'bugs',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Bug Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/projects/{project}/bugs', [
        BugController::class,
        'show',
    ]);

    Route::post('/projects/{project}/create-bug', [
        BugController::class,
        'store',
    ]);

    Route::get('/bugs/{bug}', [
        BugController::class,
        'singleBug',
    ]);

    Route::put('/bugs/{bug}/status', [
        BugController::class,
        'updateStatus',
    ]);

    Route::put('/bugs/{bug}/retest', [
        BugController::class,
        'retest',
    ]);

    Route::get('/developer/assigned-bugs', [
        BugController::class,
        'assignedBugs',
    ]);

    Route::put('/bugs/{bug}', [
        BugController::class,
        'update',
    ]);

    Route::delete('/bugs/{bug}', [
        BugController::class,
        'destroy',
    ]);
});