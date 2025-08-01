<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProgramUploadController;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');





Route::post('/upload-program', [ProgramUploadController::class, 'upload']);
Route::get('/fetch-program', [ProgramUploadController::class, 'fetch']);
Route::get('/program-load', [ProgramUploadController::class, 'load']);
//delete file
Route::delete('/program-delete', [ProgramUploadController::class, 'delete']);


// Test route to verify all registered routes
Route::get('/test-routes', function () {
    return response()->json(['routes' => Route::getRoutes()->getRoutesByName()]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
