<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProgramUploadController extends Controller
{
    private array $validOpcodes = ['0000', '0001', '0010', '1110', '1111'];

    private function isValidInstruction(string $line): bool
    {
        $line = trim($line); // Ensure line is properly trimmed
        if (!preg_match('/^[01]{8}$/', $line)) return false;
        $opcode = substr($line, 0, 4);
        return in_array($opcode, $this->validOpcodes);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'program_file' => ['required', 'file', 'mimes:txt', 'max:1024'],
        ]);

        $file = $request->file('program_file');

        if ($file->getClientOriginalName() !== 'program_instructions.txt') {
            return response()->json(['error' => 'Filename must be program_instructions.txt'], 422);
        }

        $lines = file($file->getRealPath(), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $index => $line) {
            if (!$this->isValidInstruction($line)) {
                return response()->json([
                    'error' => "Invalid instruction at line " . ($index + 1) . ": $line"
                ], 422);
            }
        }

        $path = public_path('storage/programs');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }

        if (!$file->storeAs('programs', 'program_instructions.txt', 'public')) {
            return response()->json(['error' => 'Failed to save file. Check storage permissions.'], 500);
        }

        return response()->json([
            'success' => 'Program uploaded successfully!',
            'instructions' => $lines
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
        return response()->json(['exists' => true, 'lines' => $lines]);
    }

    //delete file
    public function delete()
{
    $path = public_path('storage/programs/program_instructions.txt');

    if (!file_exists($path)) {
        return response()->json(['error' => 'No file found to delete.'], 404);
    }

    if (unlink($path)) {
        return response()->json(['success' => 'Program file deleted successfully.']);
    } else {
        return response()->json(['error' => 'Failed to delete file.'], 500);
    }
}

}
