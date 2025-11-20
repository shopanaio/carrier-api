/**
 * Tracking service for Nova Poshta API
 * Handles document tracking and status monitoring
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
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

export interface TrackingStatistics {
  readonly totalTracked: number;
  readonly delivered: number;
  readonly inTransit: number;
  readonly atWarehouse: number;
  readonly failed: number;
  readonly unknown: number;
}

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
  readonly namespace = 'tracking' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Track multiple documents
   */
  async trackDocuments(request: TrackDocumentsRequest): Promise<TrackingResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.TrackingDocument,
      calledMethod: NovaPoshtaMethod.GetStatusDocuments,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<TrackingResponse['data']>(apiRequest);
  }

  /**
   * Track a single document by number
   */
  async trackDocument(documentNumber: string, phone?: string): Promise<TrackingStatusData | null> {
    const response = await this.trackDocuments({
      Documents: [{ DocumentNumber: documentNumber, Phone: phone as any }],
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
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.TrackingDocument,
      calledMethod: NovaPoshtaMethod.GetStatusDocuments,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DocumentMovementResponse['data']>(apiRequest);
  }

  /**
   * Get list of documents for a date range
   */
  async getDocumentList(request: DocumentListRequest): Promise<DocumentListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DocumentListResponse['data']>(apiRequest);
  }

  /**
   * Track multiple documents and return organized results
   */
  async trackMultiple(documentNumbers: string[]): Promise<{
    successful: TrackingStatusData[];
    failed: string[];
    statistics: TrackingStatistics;
  }> {
    const documents = documentNumbers.map(num => ({ DocumentNumber: num }));
    const response = await this.trackDocuments({ Documents: documents });

    const successful: TrackingStatusData[] = [];
    const failed: string[] = [];

    if (response.success && response.data) {
      response.data.forEach((item, index) => {
        if (item && item.StatusCode !== DeliveryStatus.NotFound) {
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
  filterTrackingResults(results: TrackingStatusData[], filter: TrackingFilter): TrackingStatusData[] {
    return results.filter(result => {
      // Filter by status
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(result.StatusCode)) {
          return false;
        }
      }

      // Filter by date range
      if (filter.dateFrom || filter.dateTo) {
        const resultDate = new Date(result.DateCreated);

        if (filter.dateFrom && resultDate < new Date(filter.dateFrom)) {
          return false;
        }

        if (filter.dateTo && resultDate > new Date(filter.dateTo)) {
          return false;
        }
      }

      // Filter by sender city
      if (filter.citySender && !result.CitySender.includes(filter.citySender)) {
        return false;
      }

      // Filter by recipient city
      if (filter.cityRecipient && !result.CityRecipient.includes(filter.cityRecipient)) {
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
      switch (result.StatusCode) {
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
    ].includes(status.StatusCode);
  }

  /**
   * Check if document is in transit
   */
  isInTransit(status: TrackingStatusData): boolean {
    return [
      DeliveryStatus.InTransitToRecipientCity,
      DeliveryStatus.OnTheWayToRecipient,
      DeliveryStatus.BeingPacked,
    ].includes(status.StatusCode);
  }

  /**
   * Check if document is at warehouse/postomat
   */
  isAtWarehouse(status: TrackingStatusData): boolean {
    return [
      DeliveryStatus.ArrivedAtWarehouse,
      DeliveryStatus.ArrivedAtPostomat,
      DeliveryStatus.InRecipientCityAwaitingDelivery,
    ].includes(status.StatusCode);
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
      Documents: request.documents.map(doc => ({
        DocumentNumber: doc.documentNumber,
        Phone: doc.phone as any,
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
