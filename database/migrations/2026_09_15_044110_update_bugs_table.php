<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->dropForeign(['reported_by']);
            $table->string('reported_by')->change();
        });
    }

    public function down(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->unsignedBigInteger('reported_by')->change();
            $table->foreign('reported_by')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
};