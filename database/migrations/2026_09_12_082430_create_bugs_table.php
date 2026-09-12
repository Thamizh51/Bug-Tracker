<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bugs', function (Blueprint $table) {
            $table->id();

            // Project reference
            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            // Tester who reported the bug
            $table->foreignId('reported_by')
                ->constrained('users')
                ->cascadeOnDelete();

            // Developer name
            $table->string('assigned_to')->nullable();

            // Developer team
            $table->enum('assigned_team', [
                'frontend',
                'backend',
            ])->nullable();

            // Bug details
            $table->string('title');

            $table->text('description');

            $table->text('expected_result')->nullable();

            $table->text('actual_result')->nullable();

            // Screenshot path
            $table->string('image')->nullable();

            // Severity
            $table->enum('severity', [
                'low',
                'medium',
                'high',
                'critical',
            ])->default('medium');

            // Priority
            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'critical',
            ])->default('medium');

            // Status
            $table->enum('status', [
                'open',
                'assigned',
                'in_progress',
                'resolved',
                'reopened',
            ])->default('open');

            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bugs');
    }
};