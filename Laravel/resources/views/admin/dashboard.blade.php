<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Shuttle System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-dark bg-primary mb-4">
        <div class="container">
            <a class="navbar-brand" href="#">Shuttle Admin</a>
        </div>
    </nav>

    <div class="container">
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-white bg-info">
                    <div class="card-body">
                        <h5 class="card-title">Vehicles</h5>
                        <p class="card-text h2">{{ $stats['vehicles'] }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-success">
                    <div class="card-body">
                        <h5 class="card-title">Schedules</h5>
                        <p class="card-text h2">{{ $stats['schedules'] }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-warning">
                    <div class="card-body">
                        <h5 class="card-title">Bookings</h5>
                        <p class="card-text h2">{{ $stats['bookings'] }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-danger">
                    <div class="card-body">
                        <h5 class="card-title">Active Trips</h5>
                        <p class="card-text h2">{{ $stats['active_trips'] }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card mb-4">
                    <div class="card-header">Active Trips Monitoring</div>
                    <div class="card-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Driver</th>
                                    <th>Vehicle</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($active_trips as $trip)
                                <tr>
                                    <td>{{ $trip->schedule->origin }} - {{ $trip->schedule->destination }}</td>
                                    <td>{{ $trip->schedule->driver->name }}</td>
                                    <td>{{ $trip->schedule->vehicle->name }}</td>
                                    <td><span class="badge bg-success">{{ $trip->status }}</span></td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">Recent Bookings</div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            @foreach($recent_bookings as $booking)
                            <li class="list-group-item">
                                <strong>{{ $booking->user->name }}</strong><br>
                                <small>{{ $booking->schedule->origin }} → {{ $booking->schedule->destination }}</small>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
