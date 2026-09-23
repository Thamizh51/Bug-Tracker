<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\BugController;
use Illuminate\Support\Facades\Route;


Route::get('/', function(){
    return view('Auth.login');
});



Route::post('/login', [LoginController::class, 'login',])->name('login');

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