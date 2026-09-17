<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Check whether the logged-in user is an admin.
     */
    private function checkAdmin()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only admin can perform this action.',
            ], 403);
        }

        return null;
    }

    /**
     * Get all developers and testers.
     */
    public function index()
    {
        $adminCheck = $this->checkAdmin();

        if ($adminCheck !== null) {
            return $adminCheck;
        }

        $users = User::whereIn('role', ['developer', 'tester'])
            ->select([
                'id',
                'name',
                'email',
                'role',
                'department',
                'created_at',
            ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Users fetched successfully.',
            'users' => $users,
        ], 200);
    }

    /**
     * Create a developer or tester.
     */
    public function store(Request $request)
    {
        $adminCheck = $this->checkAdmin();

        if ($adminCheck !== null) {
            return $adminCheck;
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'role' => [
                'required',
                Rule::in([
                    'developer',
                    'tester',
                ]),
            ],

            'department' => [
                'nullable',
                Rule::in([
                    'frontend',
                    'backend',
                    'seo',
                    'devops',
                    'testing'
                ]),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }

    /**
     * Get developers only.
     */
    public function developers()
    {

        $developers = User::where('role', 'developer')
            ->select([
                'id',
                'name',
                'email',
                'role',
                'department',
                'created_at',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Developers fetched successfully.',
            'developers' => $developers,
        ], 200);
    }

    /**
     * Delete a developer or tester.
     */
    public function destroy(User $user)
    {
        $adminCheck = $this->checkAdmin();

        if ($adminCheck !== null) {
            return $adminCheck;
        }

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin users cannot be deleted.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ], 200);
    }
}