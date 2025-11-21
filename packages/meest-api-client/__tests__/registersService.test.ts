import { RegistersService } from '../src/services/registersService';
import { TokenManager } from '../src/core/tokenManager';
import { RequestBuilder } from '../src/utils/requestBuilder';
import type { ClientContext } from '../src/core/client';
import type { HttpTransport } from '../src/http/transport';

describe('RegistersService', () => {
  let service: RegistersService;
  let transport: jest.Mocked<HttpTransport>;
  let ctx: ClientContext;

  beforeEach(() => {
    const tokenManager = new TokenManager('test-token');
    const requestBuilder = new RequestBuilder({ baseUrl: 'https://api.test.com', tokenManager });
    transport = {
      request: jest.fn(),
    };
    ctx = { requestBuilder, transport, tokenManager };

    service = new RegistersService();
    service.attach(ctx);
  });

  describe('getAvailableTimeSlots', () => {
    it('should fetch available time slots with query params', async () => {
      const query = { date: '2024-01-15', cityID: 'CITY-1' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: [] } });

      await service.getAvailableTimeSlots(query);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/availableTimeSlots'),
          headers: expect.objectContaining({ token: 'test-token' }),
        }),
      );
    });

    it('should return available time slots result', async () => {
      const result = [
        { timeSlot: '09:00-12:00', available: true },
        { timeSlot: '12:00-15:00', available: false },
      ];
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result } });

      const response = await service.getAvailableTimeSlots({ date: '2024-01-15', cityID: 'CITY-1' });

      expect(response).toEqual(result);
    });
  });

  describe('createBranchRegister', () => {
    it('should create branch register with POST request', async () => {
      const payload = {
        cityID: 'CITY-1',
        branchID: 'BRANCH-1',
        dateFrom: '2024-01-15',
        dateTo: '2024-01-20',
      };
      transport.request.mockResolvedValue({
        status: 200,
        data: { status: 'OK', result: { registerID: 'REG-123' } },
      });

      await service.createBranchRegister(payload);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.test.com/registerBranch',
          body: payload,
          headers: expect.objectContaining({ token: 'test-token' }),
        }),
      );
    });

    it('should return register result with ID', async () => {
      const result = { registerID: 'REG-123', number: 'RN-001' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result } });

      const response = await service.createBranchRegister({});

      expect(response).toEqual(result);
    });

    it('should handle empty body', async () => {
      transport.request.mockResolvedValue({
        status: 200,
        data: { status: 'OK', result: { registerID: 'REG-123' } },
      });

      await service.createBranchRegister();

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          body: {},
        }),
      );
    });
  });

  describe('updateBranchRegister', () => {
    it('should update branch register with PUT request', async () => {
      const params = { registerID: 'REG-123' };
      const payload = { dateTo: '2024-01-25' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.updateBranchRegister(params, payload);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: 'https://api.test.com/registerBranch/REG-123',
          body: payload,
        }),
      );
    });

    it('should encode registerID in URL', async () => {
      const params = { registerID: 'REG/123' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.updateBranchRegister(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.test.com/registerBranch/REG%2F123',
        }),
      );
    });
  });

  describe('deleteBranchRegister', () => {
    it('should delete branch register with DELETE request', async () => {
      const params = { registerID: 'REG-123' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.deleteBranchRegister(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: 'https://api.test.com/registerBranch/REG-123',
        }),
      );
    });

    it('should encode special characters in registerID', async () => {
      const params = { registerID: 'REG-123/456' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.deleteBranchRegister(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.test.com/registerBranch/REG-123%2F456',
        }),
      );
    });
  });

  describe('createPickupRegister', () => {
    it('should create pickup register with POST request', async () => {
      const payload = {
        addressID: 'ADDR-1',
        cityID: 'CITY-1',
        dateFrom: '2024-01-15',
        dateTo: '2024-01-20',
        timeSlot: '09:00-12:00',
      };
      transport.request.mockResolvedValue({
        status: 200,
        data: { status: 'OK', result: { registerID: 'PREG-123' } },
      });

      await service.createPickupRegister(payload);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.test.com/registerPickup',
          body: payload,
        }),
      );
    });

    it('should return pickup register result', async () => {
      const result = { registerID: 'PREG-123', number: 'PRN-001' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result } });

      const response = await service.createPickupRegister({});

      expect(response).toEqual(result);
    });
  });

  describe('updatePickupRegister', () => {
    it('should update pickup register with PUT request', async () => {
      const params = { registerID: 'PREG-123' };
      const payload = { timeSlot: '12:00-15:00' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.updatePickupRegister(params, payload);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: 'https://api.test.com/registerPickup/PREG-123',
          body: payload,
        }),
      );
    });

    it('should encode registerID in URL', async () => {
      const params = { registerID: 'PREG/456' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.updatePickupRegister(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.test.com/registerPickup/PREG%2F456',
        }),
      );
    });
  });

  describe('deletePickupRegister', () => {
    it('should delete pickup register with DELETE request', async () => {
      const params = { registerID: 'PREG-123' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: {} } });

      await service.deletePickupRegister(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: 'https://api.test.com/registerPickup/PREG-123',
        }),
      );
    });
  });

  describe('list', () => {
    it('should list registers by date', async () => {
      const params = { dateFrom: '2024-01-15' };
      const result = [
        { registerID: 'REG-1', type: 'branch' },
        { registerID: 'REG-2', type: 'pickup' },
      ];
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result } });

      const response = await service.list(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://api.test.com/registersList/2024-01-15',
        }),
      );
      expect(response).toEqual(result);
    });

    it('should encode date in URL', async () => {
      const params = { dateFrom: '2024/01/15' };
      transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: [] } });

      await service.list(params);

      expect(transport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.test.com/registersList/2024%2F01%2F15',
        }),
      );
    });
  });

  describe('namespace', () => {
    it('should have correct namespace', () => {
      expect(service.namespace).toBe('registers');
    });
  });
});
