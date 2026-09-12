<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
        'created_by',
    ];

    /**
     * User who created the project
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Bugs belonging to this project
     */
    public function bugs(): HasMany
    {
        return $this->hasMany(Bug::class);
    }
}