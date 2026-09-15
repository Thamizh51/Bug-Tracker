<?php

use Illuminate\Support\Facades\Route;
use PhpParser\Node\Scalar\MagicConst\Dir;

Route::get('/', function () {
    return view('welcome');
});

