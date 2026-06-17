import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPositionSubject = new BehaviorSubject<Position | null>(null);
  public currentPosition$: Observable<Position | null> = this.currentPositionSubject.asObservable();
  
  private watchId: string | null = null;

  constructor() {}

  async requestPermissions() {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions', error);
      return false;
    }
  }

  async getCurrentPosition() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      this.currentPositionSubject.next(position);
      return position;
    } catch (error) {
      console.error('Error getting current position', error);
      return null;
    }
  }

  async startTracking() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      if (this.watchId !== null) return;

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (position, err) => {
          if (position) {
            this.currentPositionSubject.next(position);
          }
          if (err) {
            console.error('Error watching position', err);
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking', error);
    }
  }

  async stopTracking() {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }
}
