<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, $request) use ($exceptions) {
            // Default status code
            $status = 500;

            // Handle Unauthenticated Exception as usual
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => $e->getMessage()], 401);
                }
                return redirect()->guest(route('login'));
            }

            // Handle HTTP Exceptions
            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
            }

            // Handle Validation Exceptions separately
            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => $e->errors(),
                ], 422);
            }

            // Generic JSON response
            return response()->json([
                'message' => $e->getMessage() ?: 'Server Error',
                'trace' => config('app.debug') ? $e->getTrace() : null,
            ], $status);
        });
    })->create();
