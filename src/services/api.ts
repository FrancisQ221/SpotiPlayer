/**
 * SpotiPlayer Resilient API Client
 * Multiplatform HTTP client for Web, Windows (Tauri v2), and Android (Capacitor).
 * Features:
 * - Dynamic remote base URL resolution (VITE_API_BASE_URL)
 * - Exponential backoff retry strategy with jitter for unstable mobile connections
 * - AbortController timeout management
 * - Custom typed error hierarchies (ApiError, NetworkError, TimeoutError)
 * - Safe idempotency filters for retries
 */

import { appConfig, resolveApiBaseUrl } from './config';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipBaseUrl?: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: unknown;
  public endpoint: string;

  constructor(message: string, status: number, statusText: string, endpoint: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.endpoint = endpoint;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends Error {
  public endpoint: string;
  public originalError: Error;

  constructor(message: string, endpoint: string, originalError: Error) {
    super(message);
    this.name = 'NetworkError';
    this.endpoint = endpoint;
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends Error {
  public endpoint: string;
  public timeoutMs: number;

  constructor(message: string, endpoint: string, timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: appConfig.maxRetries || 3,
  baseDelayMs: 600,
  maxDelayMs: 4000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculates exponential backoff with full jitter to avoid thundering herd on mobile cellular towers.
 */
function calculateBackoffDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  // Full jitter: uniformly random between 0 and exponentialDelay
  return Math.floor(Math.random() * exponentialDelay);
}

/**
 * Checks whether an HTTP method is considered idempotent and safe to retry.
 */
function isIdempotentMethod(method = 'GET'): boolean {
  const upper = method.toUpperCase();
  return upper === 'GET' || upper === 'HEAD' || upper === 'OPTIONS' || upper === 'PUT' || upper === 'DELETE';
}

/**
 * Executes a resilient fetch request with exponential backoff and timeout.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestOptions = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> {
  const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = options.timeoutMs ?? appConfig.timeoutMs ?? 12000;
  const maxRetries = options.retries ?? (isIdempotentMethod(method) ? config.maxRetries : 0);
  const baseDelay = options.retryDelayMs ?? config.baseDelayMs;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // Merge external signal if supplied
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      // If status indicates transient server error and we have retries left
      if (!response.ok && config.retryableStatuses.includes(response.status) && attempt < maxRetries) {
        const delay = calculateBackoffDelay(attempt, baseDelay, config.maxDelayMs);
        console.warn(`[SpotiPlayer API] HTTP ${response.status} on ${url}. Retrying attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutTimer);

      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      // Handle explicit timeout abort
      if (error.name === 'AbortError') {
        if (options.signal?.aborted) {
          throw new NetworkError('Request aborted by user/caller', url, error);
        }
        if (attempt < maxRetries) {
          const delay = calculateBackoffDelay(attempt, baseDelay, config.maxDelayMs);
          console.warn(`[SpotiPlayer API] Timeout (${timeoutMs}ms) on ${url}. Retrying attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`, url, timeoutMs);
      }

      // Handle network drop / offline state on mobile
      if (attempt < maxRetries) {
        const delay = calculateBackoffDelay(attempt, baseDelay, config.maxDelayMs);
        console.warn(`[SpotiPlayer API] Network failure on ${url} (${error.message}). Retrying attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw new NetworkError(`Network connection failed: ${error.message}`, url, error);
    }
  }

  throw lastError || new Error(`Failed to fetch from ${url} after ${maxRetries} retries`);
}

/**
 * Universal Multiplatform SpotiPlayer API Client
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || resolveApiBaseUrl();
  }

  /**
   * Updates base URL dynamically (e.g., when switching between cloud backend and local server)
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Retrieves current active backend URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Resolves the full URL incorporating path and query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>, skipBaseUrl?: boolean): string {
    const isAbsolute = endpoint.startsWith('http://') || endpoint.startsWith('https://');
    const fullPath = skipBaseUrl || isAbsolute
      ? endpoint
      : `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    if (!params) return fullPath;

    const url = new URL(fullPath, window?.location?.origin || 'http://localhost');
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });

    return url.toString();
  }

  /**
   * Default headers for all outgoing requests across platforms
   */
  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-SpotiPlayer-Client': 'SpotiPlayer-App',
      'X-SpotiPlayer-Platform': appConfig.platform, // 'windows' | 'android' | 'web'
    };
  }

  /**
   * Core request handler returning parsed JSON
   */
  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const targetUrl = this.buildUrl(endpoint, options.params, options.skipBaseUrl);

    const mergedHeaders = {
      ...this.getDefaultHeaders(),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetchWithRetry(targetUrl, {
      ...options,
      headers: mergedHeaders,
    });

    // Handle empty 204 No Content responses safely
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = isJson ? await response.json() : await response.text();
      } catch {
        errorData = null;
      }

      throw new ApiError(
        `API request failed with status ${response.status} (${response.statusText})`,
        response.status,
        response.statusText,
        targetUrl,
        errorData
      );
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  /**
   * HTTP GET
   */
  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * HTTP POST
   */
  public async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * HTTP PUT
   */
  public async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * HTTP DELETE
   */
  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Global singleton instance configured for current environment
export const api = new ApiClient();
export default api;
