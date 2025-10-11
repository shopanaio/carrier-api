/**
 * Address service for Nova Poshta API
 * Handles all address-related operations
 */

import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
import type {
  GetSettlementsRequest,
  GetSettlementsResponse,
  GetSettlementCountryRegionRequest,
  GetSettlementCountryRegionResponse,
  GetCitiesRequest,
  GetCitiesResponse,
  GetStreetRequest,
  GetStreetResponse,
  SearchSettlementsRequest,
  SearchSettlementsResponse,
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  CitySearchResult,
  StreetSearchResult,
} from '../types/address';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';
import { schemas } from '../validation/schemas';

// Address service configuration
export interface AddressServiceConfig {
  /** Enable request validation */
  readonly validateRequests: boolean;
  /** Enable response validation */
  readonly validateResponses: boolean;
  /** Enable caching of address data */
  readonly enableCaching: boolean;
  /** Cache TTL for address data in milliseconds */
  readonly cacheTtl: number;
  /** Default timeout for address operations */
  readonly timeout?: number;
}

// Default configuration
export const DEFAULT_ADDRESS_CONFIG: AddressServiceConfig = {
  validateRequests: true,
  validateResponses: true,
  enableCaching: true,
  cacheTtl: 43200000, // 12 hours
};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Search suggestions interface
export interface SearchSuggestions {
  cities: string[];
  streets: string[];
  settlements: string[];
}

/**
 * Service for managing address operations
 *
 * @example
 * ```typescript
 * // Get settlements (areas)
 * const settlements = await addressService.getSettlements();
 *
 * // Search for cities
 * const cities = await addressService.getCities({
 *   findByString: 'Kyiv'
 * });
 *
 * // Search settlements online
 * const searchResults = await addressService.searchSettlements({
 *   cityName: 'kyiv',
 *   page: 1,
 *   limit: 50
 * });
 * ```
 */
export class AddressService {
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly searchHistory = new Set<string>();

  constructor(
    private readonly transport: HttpTransport,
    private readonly validator: NovaPoshtaValidator,
    private readonly config: AddressServiceConfig = DEFAULT_ADDRESS_CONFIG,
  ) {}

  /**
   * Get settlements (areas)
   * @description Retrieves list of settlement areas
   * @cacheable 12 hours
   */
  async getSettlements(request: GetSettlementsRequest = {}): Promise<GetSettlementsResponse> {
    const cacheKey = `settlements_${JSON.stringify(request)}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetSettlementsResponse>(cacheKey);
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getSettlementsRequest, request, 'getSettlements');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetSettlementAreas,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetSettlementsResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getSettlementsResponse');
    }

    const result = response as GetSettlementsResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get settlement country regions
   * @description Retrieves list of settlement regions for a specific area
   * @cacheable 12 hours
   */
  async getSettlementCountryRegion(request: GetSettlementCountryRegionRequest): Promise<GetSettlementCountryRegionResponse> {
    const cacheKey = `settlementCountryRegion_${request.areaRef}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetSettlementCountryRegionResponse>(cacheKey);
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getSettlementCountryRegionRequest, request, 'getSettlementCountryRegion');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetSettlementCountryRegion,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetSettlementCountryRegionResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getSettlementCountryRegionResponse');
    }

    const result = response as GetSettlementCountryRegionResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get cities
   * @description Retrieves list of cities with Nova Poshta offices
   * @cacheable 12 hours
   */
  async getCities(request: GetCitiesRequest = {}): Promise<GetCitiesResponse> {
    const cacheKey = `cities_${JSON.stringify(request)}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetCitiesResponse>(cacheKey);
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.citiesRequest, request, 'getCities');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetCities,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetCitiesResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getCitiesResponse');
    }

    const result = response as GetCitiesResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    // Track search query for suggestions
    if (request.findByString) {
      this.searchHistory.add(request.findByString.toLowerCase());
    }

    return result;
  }

  /**
   * Get streets
   * @description Retrieves list of streets in a specific city
   * @cacheable 12 hours
   */
  async getStreet(request: GetStreetRequest): Promise<GetStreetResponse> {
    const cacheKey = `streets_${JSON.stringify(request)}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetStreetResponse>(cacheKey);
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getStreetRequest, request, 'getStreet');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetStreet,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetStreetResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getStreetResponse');
    }

    const result = response as GetStreetResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    // Track search query for suggestions
    if (request.findByString) {
      this.searchHistory.add(request.findByString.toLowerCase());
    }

    return result;
  }

  /**
   * Search settlements online
   * @description Performs online search for settlements
   * @cacheable 1 hour
   */
  async searchSettlements(request: SearchSettlementsRequest): Promise<SearchSettlementsResponse> {
    const cacheKey = `searchSettlements_${JSON.stringify(request)}`;

    // Check cache first (shorter TTL for search results)
    if (this.config.enableCaching) {
      const cached = this.getCachedData<SearchSettlementsResponse>(cacheKey, 3600000); // 1 hour
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.searchSettlementsRequest, request, 'searchSettlements');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlements,
      methodProperties: {
        CityName: request.cityName,
        Page: request.page.toString(),
        Limit: request.limit.toString(),
      },
    };

    const response = await this.transport.request<SearchSettlementsResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'searchSettlementsResponse');
    }

    const result = response as SearchSettlementsResponse;

    // Cache the result with shorter TTL
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, 3600000); // 1 hour
    }

    // Track search query for suggestions
    this.searchHistory.add(request.cityName.toLowerCase());

    return result;
  }

  /**
   * Search settlement streets online
   * @description Performs online search for streets in a settlement
   * @cacheable 1 hour
   */
  async searchSettlementStreets(request: SearchSettlementStreetsRequest): Promise<SearchSettlementStreetsResponse> {
    const cacheKey = `searchSettlementStreets_${JSON.stringify(request)}`;

    // Check cache first (shorter TTL for search results)
    if (this.config.enableCaching) {
      const cached = this.getCachedData<SearchSettlementStreetsResponse>(cacheKey, 3600000); // 1 hour
      if (cached) return cached;
    }

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.searchSettlementStreetsRequest, request, 'searchSettlementStreets');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlementStreets,
      methodProperties: {
        StreetName: request.streetName,
        SettlementRef: request.settlementRef,
        Limit: request.limit?.toString(),
      },
    };

    const response = await this.transport.request<SearchSettlementStreetsResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'searchSettlementStreetsResponse');
    }

    const result = response as SearchSettlementStreetsResponse;

    // Cache the result with shorter TTL
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, 3600000); // 1 hour
    }

    // Track search query for suggestions
    this.searchHistory.add(request.streetName.toLowerCase());

    return result;
  }

  /**
   * Enhanced city search with fuzzy matching
   */
  async searchCitiesEnhanced(query: string, options: {
    maxResults?: number;
    fuzzyMatch?: boolean;
    includeRelevanceScore?: boolean;
  } = {}): Promise<CitySearchResult[]> {
    const {
      maxResults = 20,
      fuzzyMatch = true,
      includeRelevanceScore = true,
    } = options;

    const response = await this.getCities({
      findByString: query,
      limit: maxResults * 2, // Get more results for filtering
    });

    if (!response.success || !response.data) {
      return [];
    }

    let results: CitySearchResult[] = response.data.map(city => ({
      ...city,
      relevanceScore: includeRelevanceScore ? this.calculateRelevanceScore(query, city.description) : undefined,
    }));

    // Sort by relevance score if enabled
    if (includeRelevanceScore) {
      results = results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Apply fuzzy matching if enabled
    if (fuzzyMatch) {
      results = results.filter(city => this.fuzzyMatch(query, city.description));
    }

    return results.slice(0, maxResults);
  }

  /**
   * Enhanced street search with city context
   */
  async searchStreetsEnhanced(streetQuery: string, cityRef: string, options: {
    maxResults?: number;
    fuzzyMatch?: boolean;
    includeRelevanceScore?: boolean;
  } = {}): Promise<StreetSearchResult[]> {
    const {
      maxResults = 20,
      fuzzyMatch = true,
      includeRelevanceScore = true,
    } = options;

    const response = await this.getStreet({
      cityRef: cityRef as any,
      findByString: streetQuery,
      limit: maxResults * 2,
    });

    if (!response.success || !response.data) {
      return [];
    }

    let results: StreetSearchResult[] = response.data.map(street => ({
      ...street,
      relevanceScore: includeRelevanceScore ? this.calculateRelevanceScore(streetQuery, street.description) : undefined,
    }));

    // Sort by relevance score if enabled
    if (includeRelevanceScore) {
      results = results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Apply fuzzy matching if enabled
    if (fuzzyMatch) {
      results = results.filter(street => this.fuzzyMatch(streetQuery, street.description));
    }

    return results.slice(0, maxResults);
  }

  /**
   * Get search suggestions based on history
   */
  getSearchSuggestions(query: string, maxSuggestions: number = 10): SearchSuggestions {
    const lowerQuery = query.toLowerCase();

    const suggestions = Array.from(this.searchHistory)
      .filter(term => term.includes(lowerQuery) && term !== lowerQuery)
      .slice(0, maxSuggestions);

    return {
      cities: suggestions.filter(s => s.length > 2),
      streets: suggestions.filter(s => s.includes('вул.') || s.includes('просп.') || s.includes('бул.')),
      settlements: suggestions.filter(s => !s.includes('вул.') && !s.includes('просп.') && !s.includes('бул.')),
    };
  }

  /**
   * Batch city search
   */
  async searchCitiesBatch(queries: string[]): Promise<Map<string, CitySearchResult[]>> {
    const results = new Map<string, CitySearchResult[]>();

    // Process queries in parallel
    const promises = queries.map(async query => {
      const searchResults = await this.searchCitiesEnhanced(query);
      return { query, results: searchResults };
    });

    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result, index) => {
      const query = queries[index];
      if (result.status === 'fulfilled') {
        results.set(query, result.value.results);
      } else {
        results.set(query, []);
      }
    });

    return results;
  }

  /**
   * Clear all cached address data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cached entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{
      key: string;
      timestamp: number;
      ttl: number;
      expired: boolean;
    }>;
  } {
    const entries: Array<{
      key: string;
      timestamp: number;
      ttl: number;
      expired: boolean;
    }> = [];

    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expired: now > entry.timestamp + entry.ttl,
      });
    }

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Get search history statistics
   */
  getSearchHistoryStats(): {
    totalQueries: number;
    uniqueQueries: number;
    topQueries: string[];
  } {
    const queryArray = Array.from(this.searchHistory);

    return {
      totalQueries: this.searchHistory.size,
      uniqueQueries: this.searchHistory.size,
      topQueries: queryArray.slice(0, 10),
    };
  }

  /**
   * Get service configuration
   */
  getConfig(): AddressServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<AddressServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // Private helper methods
  private getCachedData<T>(key: string, customTtl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = customTtl || entry.ttl;
    const now = Date.now();

    if (now > entry.timestamp + ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private calculateRelevanceScore(query: string, target: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerTarget = target.toLowerCase();

    // Exact match
    if (lowerTarget === lowerQuery) return 1.0;

    // Starts with query
    if (lowerTarget.startsWith(lowerQuery)) return 0.9;

    // Contains query
    if (lowerTarget.includes(lowerQuery)) return 0.7;

    // Fuzzy match score
    return this.levenshteinDistance(lowerQuery, lowerTarget) / Math.max(lowerQuery.length, lowerTarget.length);
  }

  private fuzzyMatch(query: string, target: string, threshold: number = 0.6): boolean {
    const score = this.calculateRelevanceScore(query, target);
    return score >= threshold;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }
}
