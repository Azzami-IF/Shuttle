import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface SearchFilters {
  origin?: string;
  destination?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  priceMin?: number;
  priceMax?: number;
  availableSeatsMin?: number;
  vehicleType?: string;
  driverId?: number;
  availableOnly?: boolean;
  sortBy?: 'departure_time' | 'price' | 'available_seats';
  sortOrder?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
}

export interface FilterCategory {
  timePeriods: Array<{
    label: string;
    value: string;
    timeFrom: string;
    timeTo: string;
  }>;
  priceRanges: Array<{
    label: string;
    value: string;
    min: number;
    max: number;
  }>;
  vehicleTypes: Array<{
    label: string;
    value: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  private filtersSubject = new BehaviorSubject<SearchFilters>({
    sortBy: 'departure_time',
    sortOrder: 'asc',
    perPage: 15,
    page: 1
  });

  filters$ = this.filtersSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<FilterCategory | null>(null);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadCategories();
  }

  /**
   * Load available filter categories (time periods, price ranges, vehicle types)
   */
  private loadCategories() {
    this.api.get('search/categories').subscribe((data: FilterCategory) => {
      this.categoriesSubject.next(data);
    });
  }

  /**
   * Update filters and trigger search
   */
  updateFilters(filters: Partial<SearchFilters>) {
    const current = this.filtersSubject.value;
    const updated = { ...current, ...filters, page: 1 };
    this.filtersSubject.next(updated);
  }

  /**
   * Reset all filters to defaults
   */
  resetFilters() {
    this.filtersSubject.next({
      sortBy: 'departure_time',
      sortOrder: 'asc',
      perPage: 15,
      page: 1
    });
  }

  /**
   * Get current filters
   */
  getFilters(): SearchFilters {
    return this.filtersSubject.value;
  }

  /**
   * Advanced search with filters
   */
  search(filters?: SearchFilters): Observable<any> {
    const f = filters || this.filtersSubject.value;
    
    let params = new HttpParams();
    Object.keys(f).forEach(key => {
      const value = (f as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.api.get('search/schedules', { params });
  }

  /**
   * Get autocomplete suggestions for origin/destination
   */
  getOriginSuggestions(query: string): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('type', 'origin');
    
    return this.api.get('search/suggestions', { params });
  }

  /**
   * Get autocomplete suggestions for destination
   */
  getDestinationSuggestions(query: string): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('type', 'destination');
    
    return this.api.get('search/suggestions', { params });
  }

  /**
   * Get popular routes
   */
  getPopularRoutes(limit: number = 10, days: number = 30): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('days', days.toString());
    
    return this.api.get('search/popular-routes', { params });
  }

  /**
   * Get filter categories
   */
  getCategories(): Observable<FilterCategory | null> {
    return this.categories$;
  }

  /**
   * Change sort order
   */
  setSortBy(sortBy: 'departure_time' | 'price' | 'available_seats', sortOrder: 'asc' | 'desc' = 'asc') {
    this.updateFilters({ sortBy, sortOrder });
  }

  /**
   * Set pagination
   */
  setPage(page: number) {
    this.updateFilters({ page });
  }

  /**
   * Set price range filter
   */
  setPriceRange(min: number, max: number) {
    this.updateFilters({ priceMin: min, priceMax: max });
  }

  /**
   * Set time range filter
   */
  setTimeRange(timeFrom: string, timeTo: string) {
    this.updateFilters({ timeFrom, timeTo });
  }

  /**
   * Apply quick filter by category
   */
  applyQuickFilter(category: string, value: string, categories: FilterCategory) {
    if (category === 'time') {
      const timePeriod = categories.timePeriods.find(tp => tp.value === value);
      if (timePeriod) {
        this.setTimeRange(timePeriod.timeFrom, timePeriod.timeTo);
      }
    } else if (category === 'price') {
      const priceRange = categories.priceRanges.find(pr => pr.value === value);
      if (priceRange) {
        this.setPriceRange(priceRange.min, priceRange.max);
      }
    } else if (category === 'vehicle') {
      this.updateFilters({ vehicleType: value });
    }
  }

  /**
   * Clear specific filter
   */
  clearFilter(key: string) {
    const current = this.filtersSubject.value;
    const updated = { ...current };
    delete (updated as any)[key];
    this.filtersSubject.next(updated);
  }

  /**
   * Build query string from filters
   */
  buildQueryString(filters?: SearchFilters): string {
    const f = filters || this.filtersSubject.value;
    const params = new URLSearchParams();
    
    Object.keys(f).forEach(key => {
      const value = (f as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }
}
