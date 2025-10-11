/**
 * Tracking service for Nova Poshta API
 * Handles document tracking and status monitoring
 */

import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
import type {
  TrackDocumentsRequest,
  TrackingResponse,
  DocumentMovementRequest,
  DocumentMovementResponse,
  DocumentListRequest,
  DocumentListResponse,
  TrackingStatusData,
} from '../types/tracking';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod, DeliveryStatus } from '../types/enums';
import { schemas } from '../validation/schemas';

// Tracking service configuration
export interface TrackingServiceConfig {
  /** Enable request validation */
  readonly validateRequests: boolean;
  /** Enable response validation */
  readonly validateResponses: boolean;
  /** Default timeout for tracking operations */
  readonly timeout?: number;
  /** Enable caching of tracking results */
  readonly enableCaching: boolean;
  /** Cache TTL for tracking data in milliseconds */
  readonly trackingCacheTtl: number;
}

// Default configuration
export const DEFAULT_TRACKING_CONFIG: TrackingServiceConfig = {
  validateRequests: true,
  validateResponses: true,
  enableCaching: true,
  trackingCacheTtl: 300000, // 5 minutes
};

// Tracking statistics
export interface TrackingStatistics {
  readonly totalTracked: number;
  readonly delivered: number;
  readonly inTransit: number;
  readonly atWarehouse: number;
  readonly failed: number;
  readonly unknown: number;
}

// Tracking filter options
export interface TrackingFilter {
  readonly status?: DeliveryStatus[];
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly citySender?: string;
  readonly cityRecipient?: string;
}

/**
 * Service for tracking documents and monitoring delivery status
 */
export class TrackingService {
  constructor(
    private readonly transport: HttpTransport,
    private readonly validator: NovaPoshtaValidator,
    private readonly config: TrackingServiceConfig = DEFAULT_TRACKING_CONFIG,
  ) {}

  /**
   * Track multiple documents
   */
  async trackDocuments(request: TrackDocumentsRequest): Promise<TrackingResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.trackDocumentsRequest, request, 'trackDocuments');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.TrackingDocument,
      calledMethod: NovaPoshtaMethod.GetStatusDocuments,
      methodProperties: {
        Documents: request.documents.map(doc => ({
          DocumentNumber: doc.documentNumber,
          Phone: doc.phone,
        })),
      },
    };

    const response = await this.transport.request<TrackingResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'trackDocumentsResponse');
    }

    return response as TrackingResponse;
  }

  /**
   * Track a single document by number
   */
  async trackDocument(documentNumber: string, phone?: string): Promise<TrackingStatusData | null> {
    const response = await this.trackDocuments({
      documents: [{ documentNumber, phone: phone as any }],
    });

    if (response.success && response.data.length > 0) {
      return response.data[0] || null;
    }

    return null;
  }

  /**
   * Get document movement history
   */
  async getDocumentMovement(request: DocumentMovementRequest): Promise<DocumentMovementResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.trackDocumentsRequest, request, 'getDocumentMovement');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.TrackingDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentsEWMovement,
      methodProperties: {
        Documents: request.documents.map(doc => ({
          DocumentNumber: doc.documentNumber,
          Phone: doc.phone,
        })),
        ShowDeliveryDetails: request.showDeliveryDetails ? '1' : '0',
      },
    };

    const response = await this.transport.request<DocumentMovementResponse['data']>(apiRequest);

    return response as DocumentMovementResponse;
  }

  /**
   * Get list of documents for a date range
   */
  async getDocumentList(request: DocumentListRequest): Promise<DocumentListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentList,
      methodProperties: {
        DateTimeFrom: request.dateTimeFrom,
        DateTimeTo: request.dateTimeTo,
        Page: request.page?.toString() || '1',
        GetFullList: request.getFullList || '0',
        DateTime: request.dateTime,
      },
    };

    const response = await this.transport.request<DocumentListResponse['data']>(apiRequest);

    return response as DocumentListResponse;
  }

  /**
   * Track multiple documents and return organized results
   */
  async trackMultiple(documentNumbers: string[]): Promise<{
    successful: TrackingStatusData[];
    failed: string[];
    statistics: TrackingStatistics;
  }> {
    const documents = documentNumbers.map(num => ({ documentNumber: num }));
    const response = await this.trackDocuments({ documents });

    const successful: TrackingStatusData[] = [];
    const failed: string[] = [];

    if (response.success && response.data) {
      response.data.forEach((item, index) => {
        if (item && item.statusCode !== DeliveryStatus.NotFound) {
          successful.push(item);
        } else {
          failed.push(documentNumbers[index] || 'unknown');
        }
      });
    } else {
      failed.push(...documentNumbers);
    }

    const statistics = this.calculateStatistics(successful);

    return {
      successful,
      failed,
      statistics,
    };
  }

  /**
   * Filter tracking results by criteria
   */
  filterTrackingResults(
    results: TrackingStatusData[],
    filter: TrackingFilter
  ): TrackingStatusData[] {
    return results.filter(result => {
      // Filter by status
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(result.statusCode)) {
          return false;
        }
      }

      // Filter by date range
      if (filter.dateFrom || filter.dateTo) {
        const resultDate = new Date(result.dateCreated);

        if (filter.dateFrom && resultDate < new Date(filter.dateFrom)) {
          return false;
        }

        if (filter.dateTo && resultDate > new Date(filter.dateTo)) {
          return false;
        }
      }

      // Filter by sender city
      if (filter.citySender && !result.citySender.includes(filter.citySender)) {
        return false;
      }

      // Filter by recipient city
      if (filter.cityRecipient && !result.cityRecipient.includes(filter.cityRecipient)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get tracking statistics for a set of results
   */
  calculateStatistics(results: TrackingStatusData[]): TrackingStatistics {
    const stats = {
      totalTracked: results.length,
      delivered: 0,
      inTransit: 0,
      atWarehouse: 0,
      failed: 0,
      unknown: 0,
    };

    results.forEach(result => {
      switch (result.statusCode) {
        case DeliveryStatus.Received:
        case DeliveryStatus.ReceivedAwaitingMoneyTransfer:
        case DeliveryStatus.ReceivedAndMoneyTransferred:
          stats.delivered++;
          break;

        case DeliveryStatus.InTransitToRecipientCity:
        case DeliveryStatus.OnTheWayToRecipient:
        case DeliveryStatus.BeingPacked:
          stats.inTransit++;
          break;

        case DeliveryStatus.ArrivedAtWarehouse:
        case DeliveryStatus.ArrivedAtPostomat:
        case DeliveryStatus.InRecipientCityAwaitingDelivery:
          stats.atWarehouse++;
          break;

        case DeliveryStatus.RefusedByRecipient:
        case DeliveryStatus.RefusedByRecipientReturnCreated:
        case DeliveryStatus.FailedDeliveryAttempt:
          stats.failed++;
          break;

        default:
          stats.unknown++;
          break;
      }
    });

    return stats;
  }

  /**
   * Check if document is delivered
   */
  isDelivered(status: TrackingStatusData): boolean {
    return [
      DeliveryStatus.Received,
      DeliveryStatus.ReceivedAwaitingMoneyTransfer,
      DeliveryStatus.ReceivedAndMoneyTransferred,
    ].includes(status.statusCode);
  }

  /**
   * Check if document is in transit
   */
  isInTransit(status: TrackingStatusData): boolean {
    return [
      DeliveryStatus.InTransitToRecipientCity,
      DeliveryStatus.OnTheWayToRecipient,
      DeliveryStatus.BeingPacked,
    ].includes(status.statusCode);
  }

  /**
   * Check if document is at warehouse/postomat
   */
  isAtWarehouse(status: TrackingStatusData): boolean {
    return [
      DeliveryStatus.ArrivedAtWarehouse,
      DeliveryStatus.ArrivedAtPostomat,
      DeliveryStatus.InRecipientCityAwaitingDelivery,
    ].includes(status.statusCode);
  }

  /**
   * Get human-readable status description
   */
  getStatusDescription(status: DeliveryStatus, language: 'ua' | 'ru' | 'en' = 'ua'): string {
    const descriptions: Partial<Record<DeliveryStatus, { ua: string; ru: string; en: string }>> = {
      [DeliveryStatus.CreatedBySender]: {
        ua: 'Створено відправником',
        ru: 'Создано отправителем',
        en: 'Created by sender',
      },
      [DeliveryStatus.Deleted]: {
        ua: 'Видалено',
        ru: 'Удалено',
        en: 'Deleted',
      },
      [DeliveryStatus.NotFound]: {
        ua: 'Не знайдено',
        ru: 'Не найдено',
        en: 'Not found',
      },
      [DeliveryStatus.InTransitToRecipientCity]: {
        ua: 'Прямує до міста одержувача',
        ru: 'Направляется в город получателя',
        en: 'En route to recipient city',
      },
      [DeliveryStatus.Received]: {
        ua: 'Отримано',
        ru: 'Получено',
        en: 'Delivered',
      },
      // Add more status descriptions as needed
    };

    return descriptions[status]?.[language] || `Unknown status: ${status}`;
  }

  /**
   * Monitor documents with periodic updates
   */
  async monitorDocuments(
    documentNumbers: string[],
    callback: (results: TrackingStatusData[]) => void,
    intervalMs: number = 300000, // 5 minutes
  ): Promise<() => void> {
    const monitor = async () => {
      try {
        const response = await this.trackMultiple(documentNumbers);
        callback(response.successful);
      } catch (error) {
        console.error('Error monitoring documents:', error);
      }
    };

    // Initial check
    await monitor();

    // Set up periodic monitoring
    const intervalId = setInterval(monitor, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Get service configuration
   */
  getConfig(): TrackingServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<TrackingServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS
  // =============================================================================

  /**
   * Track waybill (legacy method for compatibility)
   * @deprecated Use trackDocument() or trackDocuments() method instead
   */
  async trackWaybill(request: {
    documents: Array<{
      documentNumber: string;
      phone?: string;
    }>;
  }): Promise<TrackingResponse> {
    return this.trackDocuments({
      documents: request.documents.map(doc => ({
        documentNumber: doc.documentNumber,
        phone: doc.phone as any,
      })),
    });
  }

  /**
   * Get status documents (legacy method for compatibility)
   * @deprecated Use trackDocuments() method instead
   */
  async getStatusDocuments(request: TrackDocumentsRequest): Promise<TrackingResponse> {
    return this.trackDocuments(request);
  }
}
