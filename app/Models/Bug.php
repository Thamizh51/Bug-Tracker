<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Bug extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'reported_by',
        'assigned_to',
        'assigned_team',
        'title',
        'description',
        'expected_result',
        'actual_result',
        'image',
        'url',
        'severity',
        'priority',
        'status',
        'resolved_at',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter()
    {
        return $this->belongsTo(
            User::class,
            'reported_by',
            'name'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        return Storage::url($this->image);
    }
}