<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProgramUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'program_file' => ['required', 'file', 'mimes:txt', 'max:1024'],
        ]);

        $file = $request->file('program_file');

        if ($file->getClientOriginalName() !== 'program_instructions.txt') {
            return response()->json(['error' => 'Filename must be program_instructions.txt'], 422);
        }

        // Store in public disk instead of local
        $file->storeAs('programs', 'program_instructions.txt', 'public');

        // Verify file was saved and read its contents
        $path = public_path('storage/programs/program_instructions.txt');
        if (!file_exists($path)) {
            return response()->json(['error' => 'Failed to save file. Check storage permissions.'], 500);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return response()->json([
            'success' => 'Program uploaded successfully!',
            'lines' => $lines
        ]);
    }

    public function fetch()
    {
        $path = public_path('storage/programs/program_instructions.txt');
        if (!file_exists($path)) {
            return response()->json(['error' => 'No instruction file found.'], 404);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return response()->json(['instructions' => $lines]);
    }

    public function load()
    {
        $path = public_path('storage/programs/program_instructions.txt');
        if (!file_exists($path)) {
            return response()->json(['exists' => false]);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return response()->json([
            'exists' => true,
            'lines' => $lines
        ]);
    }
}
