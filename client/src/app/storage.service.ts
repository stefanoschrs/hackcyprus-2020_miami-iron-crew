import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage

  constructor() {
    this.storage = {}
  }

  get (key) {
    return this.storage[key]
  }

  set (key, value) {
    this.storage[key] = value
  }
}
