<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestCase extends Model
{
    use HasFactory;

    protected $table = 'test_cases';

    protected $fillable = [
        'project_id',
        'test_case_code',
        'title',
        'module',
        'description',
        'preconditions',
        'steps',
        'expected_result',
        'actual_result',
        'type',
        'priority',
        'severity',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * The product/project this test case belongs to.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * All bugs discovered under this test case.
     */
    public function bugs()
    {
        return $this->hasMany(Bug::class);
    }

    /**
     * User/tester who created this test case.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
