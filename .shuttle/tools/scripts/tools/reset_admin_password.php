<?php
require __DIR__ . '/../Laravel/vendor/autoload.php';
$app = require __DIR__ . '/../Laravel/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = App\Models\User::where('email', 'admin@shuttle.com')->first();
if (!$admin) {
    echo "Admin user not found\n";
    exit(1);
}

$admin->password = Illuminate\Support\Facades\Hash::make('password');
$admin->save();
echo "Admin password reset for admin@shuttle.com\n";
