import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m', // 5 minute test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['<0.1'], // Error rate must be less than 0.1%
  },
};

const BASE_URL = 'http://localhost:8000/api';

export default function() {
  group('API Performance Test', function() {
    // Test Dashboard
    let dashRes = http.get(`${BASE_URL}/admin/dashboard/stats`);
    check(dashRes, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // Test Schedules List
    let schedRes = http.get(`${BASE_URL}/admin/schedules?page=1&per_page=20`);
    check(schedRes, {
      'schedules status is 200': (r) => r.status === 200,
      'schedules response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // Test Bookings List
    let bookRes = http.get(`${BASE_URL}/admin/bookings?status=booked&page=1`);
    check(bookRes, {
      'bookings status is 200': (r) => r.status === 200,
      'bookings response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(2);
  });
}
