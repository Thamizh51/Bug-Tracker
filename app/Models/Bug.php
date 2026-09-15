<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bug extends Model
{
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

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /**
     * Automatically include image_url in JSON responses.
     */
    protected $appends = [
        'image_url',
    ];

    /**
     * Return the complete public image URL.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }

    /**
     * Project this bug belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Tester who reported the bug.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by', 'name');
    }
}