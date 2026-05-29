import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { debounceTime, Subject } from 'rxjs';
import { SearchFilterService, FilterCategory } from '../../services/search-filter.service';

@Component({
  selector: 'app-schedule-search',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './schedule-search.component.html',
  styleUrls: ['./schedule-search.component.scss']
})
export class ScheduleSearchComponent implements OnInit {
  @Input() showAdvancedFilters = false;
  @Output() filtersChanged = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();

  // Search inputs
  origin = '';
  destination = '';
  date = '';
  searchTerm = '';

  // Advanced filters
  timeFrom = '';
  timeTo = '';
  priceMin = '';
  priceMax = '';
  availableSeatsMin = '';
  vehicleType = '';
  availableOnly = false;

  // UI state
  showAdvancedToggle = false;
  originSuggestions: string[] = [];
  destinationSuggestions: string[] = [];
  categories: FilterCategory | null = null;
  selectedQuickFilters: { [key: string]: string } = {};

  private searchSubject = new Subject<string>();
  private originSearchSubject = new Subject<string>();
  private destSearchSubject = new Subject<string>();

  constructor(private searchFilterService: SearchFilterService) {}

  ngOnInit() {
    // Get filter categories
    this.searchFilterService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    // Debounce search term changes
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });

    // Debounce autocomplete searches
    this.originSearchSubject.pipe(debounceTime(400)).subscribe(query => {
      if (query.length > 2) {
        this.searchFilterService.getOriginSuggestions(query).subscribe((data: any) => {
          this.originSuggestions = data.suggestions || [];
        });
      }
    });

    this.destSearchSubject.pipe(debounceTime(400)).subscribe(query => {
      if (query.length > 2) {
        this.searchFilterService.getDestinationSuggestions(query).subscribe((data: any) => {
          this.destinationSuggestions = data.suggestions || [];
        });
      }
    });
  }

  /**
   * Handle search term input
   */
  onSearchInput(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  /**
   * Handle origin input for autocomplete
   */
  onOriginInput(value: string) {
    this.origin = value;
    if (value.length > 2) {
      this.originSearchSubject.next(value);
    }
  }

  /**
   * Handle destination input for autocomplete
   */
  onDestinationInput(value: string) {
    this.destination = value;
    if (value.length > 2) {
      this.destSearchSubject.next(value);
    }
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    const filters: any = {
      origin: this.origin || undefined,
      destination: this.destination || undefined,
      date: this.date || undefined,
      timeFrom: this.timeFrom || undefined,
      timeTo: this.timeTo || undefined,
      priceMin: this.priceMin ? parseInt(this.priceMin) : undefined,
      priceMax: this.priceMax ? parseInt(this.priceMax) : undefined,
      availableSeatsMin: this.availableSeatsMin ? parseInt(this.availableSeatsMin) : undefined,
      vehicleType: this.vehicleType || undefined,
      availableOnly: this.availableOnly || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    this.searchFilterService.updateFilters(filters);
    this.filtersChanged.emit();
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.origin = '';
    this.destination = '';
    this.date = '';
    this.searchTerm = '';
    this.timeFrom = '';
    this.timeTo = '';
    this.priceMin = '';
    this.priceMax = '';
    this.availableSeatsMin = '';
    this.vehicleType = '';
    this.availableOnly = false;
    this.selectedQuickFilters = {};

    this.searchFilterService.resetFilters();
    this.filtersChanged.emit();
  }

  /**
   * Apply quick filter (time, price, vehicle type)
   */
  applyQuickFilter(category: string, value: string) {
    if (!this.categories) return;

    if (this.selectedQuickFilters[category] === value) {
      // Toggle off
      delete this.selectedQuickFilters[category];
    } else {
      // Select this filter
      this.selectedQuickFilters[category] = value;
    }

    this.searchFilterService.applyQuickFilter(category, value, this.categories);
    this.filtersChanged.emit();
  }

  /**
   * Check if quick filter is selected
   */
  isQuickFilterSelected(category: string, value: string): boolean {
    return this.selectedQuickFilters[category] === value;
  }

  /**
   * Get number of active filters
   */
  getActiveFilterCount(): number {
    let count = 0;
    if (this.origin) count++;
    if (this.destination) count++;
    if (this.date) count++;
    if (this.timeFrom || this.timeTo) count++;
    if (this.priceMin || this.priceMax) count++;
    if (this.availableSeatsMin) count++;
    if (this.vehicleType) count++;
    if (this.availableOnly) count++;
    return count;
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvancedFilters() {
    this.showAdvancedToggle = !this.showAdvancedToggle;
  }

  /**
   * Select origin suggestion
   */
  selectOrigin(value: string) {
    this.origin = value;
    this.originSuggestions = [];
    this.applyFilters();
  }

  /**
   * Select destination suggestion
   */
  selectDestination(value: string) {
    this.destination = value;
    this.destinationSuggestions = [];
    this.applyFilters();
  }

  /**
   * Emit search event
   */
  performSearch() {
    this.applyFilters();
    this.search.emit();
  }
}
