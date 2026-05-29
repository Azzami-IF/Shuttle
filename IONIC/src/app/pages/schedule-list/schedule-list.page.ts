import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SearchFilterService, SearchFilters } from '../../services/search-filter.service';

@Component({
  standalone: false,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss'],
})
export class ScheduleListPage {
  schedules: any[] = [];
  displaySchedules: any[] = [];
  loading: boolean = false;
  filters: SearchFilters = {};
  sortBy: string = 'departure_time';
  homeRoute = '/dashboard';
  currentPage = 1;
  totalPages = 1;
  hasNextPage = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private searchFilterService: SearchFilterService
  ) {}

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.route.queryParams.subscribe(params => {
      // Initialize filters from query params if available
      if (params['origin']) this.filters.origin = params['origin'];
      if (params['destination']) this.filters.destination = params['destination'];
      if (params['date']) this.filters.date = params['date'];
      
      this.performSearch();
    });

    // Subscribe to filter changes from the search component
    this.searchFilterService.filters$.subscribe(filters => {
      this.filters = filters;
    });
  }

  /**
   * Perform advanced search with filters
   */
  performSearch() {
    this.loading = true;
    this.searchFilterService.search(this.filters).subscribe(
      (response: any) => {
        this.schedules = response.data || [];
        this.displaySchedules = [...this.schedules];
        this.currentPage = response.current_page || 1;
        this.totalPages = response.last_page || 1;
        this.hasNextPage = this.currentPage < this.totalPages;
        this.loading = false;
      },
      (error) => {
        console.error('Search error:', error);
        this.loading = false;
        this.schedules = [];
        this.displaySchedules = [];
      }
    );
  }

  /**
   * Handle filter changes from search component
   */
  onFiltersChanged() {
    this.currentPage = 1;
    this.performSearch();
  }

  /**
   * Load next page of results
   */
  loadNextPage() {
    if (this.hasNextPage) {
      this.searchFilterService.setPage(this.currentPage + 1);
      this.performSearch();
    }
  }

  /**
   * Load previous page of results
   */
  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.searchFilterService.setPage(this.currentPage - 1);
      this.performSearch();
    }
  }

  /**
   * Get available seats count for a schedule
   */
  getAvailableSeats(schedule: any) {
    if (typeof schedule?.available_seats === 'number') {
      return schedule.available_seats;
    }

    if (typeof schedule?.availableSeats === 'number') {
      return schedule.availableSeats;
    }

    if (!schedule?.seats) return 0;
    return schedule.seats.filter((seat: any) => seat.status === 'available' || seat.is_available === true).length;
  }

  /**
   * Get booked seats count for a schedule
   */
  getBookedSeats(schedule: any) {
    if (typeof schedule?.booked_seats === 'number') {
      return schedule.booked_seats;
    }

    if (!schedule.bookings) return 0;
    return schedule.bookings.filter((b: any) => b.status === 'booked').length;
  }

  /**
   * Navigate to seat selection page
   */
  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', id]);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Format time for display
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /**
   * Check if schedule has available seats
   */
  hasAvailableSeats(schedule: any): boolean {
    return this.getAvailableSeats(schedule) > 0;
  }

  /**
   * Open filters (for mobile or enhanced UI)
   */
  openFilters() {
    // This can trigger a modal or expand the search component
    // Implementation depends on your UI framework
  }
}
