/**
 * Configuration Service
 * 
 * Centralizes environment configuration access for the application.
 * This service provides methods to retrieve environment-specific settings
 * such as API URLs, environment names, and MSAL configuration.
 * 
 * @Injectable providedIn: 'root' - Singleton service available application-wide
 */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * MSAL Configuration Interface
 * Defines the structure for Microsoft Authentication Library configuration
 */
export interface MsalConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
}

/**
 * ConfigService
 * 
 * Provides centralized access to environment configuration settings.
 * Components and services should use this service instead of directly
 * importing environment files.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  
  /**
   * Get the base API URL for HTTP requests
   * @returns The API URL string from environment configuration
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }
  
  /**
   * Get the current environment name
   * @returns 'development' or 'production' based on environment.production flag
   */
  getEnvironmentName(): 'development' | 'production' {
    return environment.production ? 'production' : 'development';
  }
  
  /**
   * Check if the application is running in production mode
   * @returns true if running in production, false otherwise
   */
  isProduction(): boolean {
    return environment.production;
  }
  
  /**
   * Get the MSAL (Microsoft Authentication Library) configuration
   * @returns MsalConfig object containing clientId, authority, and redirectUri
   */
  getMsalConfig(): MsalConfig {
    return environment.msalConfig;
  }
}
