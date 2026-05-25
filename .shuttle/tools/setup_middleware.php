#!/usr/bin/env php
<?php

// Create middleware directory
$middlewareDir = __DIR__ . '/Laravel/app/Http/Middleware';
if (!is_dir($middlewareDir)) {
    mkdir($middlewareDir, 0755, true);
}

// Create CompressResponse middleware
$compressMiddleware = <<<'PHP'
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CompressResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        if (config('compression.enabled') && 
            $request->header('Accept-Encoding') && 
            strpos($request->header('Accept-Encoding'), 'gzip') !== false) {
            
            if (strlen($response->getContent()) > config('compression.minimum_length')) {
                $response->setContent(gzencode($response->getContent(), config('compression.level')));
                $response->header('Content-Encoding', 'gzip');
            }
        }
        
        return $response;
    }
}
PHP;

file_put_contents($middlewareDir . '/CompressResponse.php', $compressMiddleware);
echo "CompressResponse middleware created successfully.\n";
