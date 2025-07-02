<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    const STATUS_CODE_SUCCESS = 200;

    const STATUS_CODE_NOT_FOUND = 404;

    public function success(string $message = '', $data = [], int $statusCode = self::STATUS_CODE_SUCCESS)
    {
        $response = ['status' => true, 'message' => $message, 'data' => $data];

        return response()->json($response, $statusCode);
    }

    public function failed(string $message = '', $data = [], int $statusCode = self::STATUS_CODE_NOT_FOUND)
    {
        $response = ['status' => false, 'message' => $message, 'data' => $data];

        return response()->json($response, $statusCode);
    }

    public function errorLog(Exception $e, string $message = 'Some error occurred'): void
    {
        Log::error($message, ['error_msg' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'time' => now()->toDateTimeString()]);
    }
}
