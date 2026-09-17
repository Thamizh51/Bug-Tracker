
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

            // Tester name who reported the bug
            $table->string('reported_by');

            // Developer name assigned to the bug
            $table->string('assigned_to')->nullable();

            // Developer team
            $table->enum('assigned_team', [
                'frontend',
                'backend',
                'seo',
                'devops',
            ])->nullable();

            // Bug details
            $table->string('title');

            $table->text('description');

            $table->text('expected_result')->nullable();

            $table->text('actual_result')->nullable();

            // Screenshot path
            $table->string('image')->nullable();

            // Bug URL
            $table->string('url', 2000)->nullable();

            // Severity
            $table->enum('severity', [
                'critical',
                'high',
                'medium',
                'low',
            ])->default('medium');

            // Priority
            $table->enum('priority', [
                'urgent',
                'high',
                'medium',
                'low',
            ])->default('medium');

            // Bug status
            $table->enum('status', [
                'assigned',
                'pending',
                'in_progress',
                'resolved',
                'reopened',
                'closed',
            ])->default('assigned');

            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bugs');
    }
};