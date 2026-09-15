<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->string('assigned_team')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->enum('assigned_team', [
                'frontend',
                'backend',
            ])->nullable()->change();
        });
    }
};
