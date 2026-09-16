<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'assigned',
                'in_progress',
                'pending',
                'resolved',
                'reopened',
            ])->default('open')->change();
        });
    }

    public function down(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->enum('status', [
                'open',
                'assigned',
                'in_progress',
                'resolved',
                'reopened',
            ])->default('open')->change();
        });
    }
};