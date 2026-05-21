import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api'; // Standard Laravel port

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    });
  }

  get(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${path}`, { headers: this.getHeaders() });
  }

  post(path: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${path}`, data, { headers: this.getHeaders() });
  }

  put(path: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${path}`, data, { headers: this.getHeaders() });
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${path}`, { headers: this.getHeaders() });
  }
}
