<?php
/**
 * Setup script for API Response Optimization
 * Run this script to set up all required middleware and configuration
 * 
 * Usage: php setup_optimization.php
 */

$baseDir = __DIR__ . '/Laravel';

// 1. Create Middleware directory
$middlewareDir = $baseDir . '/app/Http/Middleware';
if (!is_dir($middlewareDir)) {
    if (@mkdir($middlewareDir, 0755, true)) {
        echo "[✓] Created middleware directory\n";
    } else {
        echo "[!] Could not create middleware directory\n";
    }
}

// 2. Create CompressResponse middleware
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

if (file_put_contents($middlewareDir . '/CompressResponse.php', $compressMiddleware)) {
    echo "[✓] Created CompressResponse middleware\n";
} else {
    echo "[!] Could not create middleware file\n";
}

// 3. Create .gitkeep to ensure directory is tracked
file_put_contents($middlewareDir . '/.gitkeep', '');

echo "\n[✓] Setup complete!\n";
echo "\nNext steps:\n";
echo "1. Update Laravel/bootstrap/app.php to register the middleware (see setup_update_bootstrap.md)\n";
echo "2. Update Laravel/routes/api.php to add throttle middleware groups\n";
echo "3. Run tests to verify installation\n";
