<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('test_cases', function (Blueprint $table) {
            $table->id();

            // Product / Project reference (One project has many test cases)
            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            // Test Case Code / Identifier (e.g., TC-AIP-001)
            $table->string('test_case_code')->nullable();

            // Title & Categorization
            $table->string('title');
            $table->string('module')->nullable();

            // Detailed Specifications
            $table->text('description')->nullable();
            $table->text('preconditions')->nullable();
            $table->text('steps')->nullable();
            $table->text('expected_result')->nullable();
            $table->text('actual_result')->nullable();

            // Classification
            $table->enum('type', [
                'functional',
                'ui',
                'regression',
                'smoke',
                'integration',
                'performance',
                'security',
            ])->default('functional');

            $table->enum('priority', [
                'urgent',
                'high',
                'medium',
                'low',
            ])->default('medium');

            $table->enum('severity', [
                'critical',
                'high',
                'medium',
                'low',
            ])->default('medium');

            $table->enum('status', [
                'pending',
                'passed',
                'failed',
                'blocked',
                'in_progress',
            ])->default('pending');

            // Tester or creator reference
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_cases');
    }
};
