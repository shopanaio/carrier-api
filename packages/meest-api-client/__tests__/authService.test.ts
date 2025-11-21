import { AuthService } from '../src/services/authService';
import { SearchService } from '../src/services/searchService';
import { TokenManager } from '../src/core/tokenManager';
import { RequestBuilder } from '../src/utils/requestBuilder';
import type { ClientContext } from '../src/core/client';
import type { HttpRequest, HttpResponse, HttpTransport } from '../src/http/transport';
import { ParcelsService } from '../src/services/parcelsService';
import { PrintService } from '../src/services/printService';
import { TrackingService } from '../src/services/trackingService';
import { MiscService } from '../src/services/miscService';

describe('Meest client services', () => {
  function createContext(baseUrl = 'https://api.test'): { ctx: ClientContext; transport: jest.Mocked<HttpTransport> } {
    const tokenManager = new TokenManager();
    const requestBuilder = new RequestBuilder({ baseUrl, tokenManager });
    const transport: jest.Mocked<HttpTransport> = {
      request: jest.fn(),
    };
    return {
      ctx: { requestBuilder, transport, tokenManager },
      transport,
    };
  }

  it('auth.login stores token and omits token header', async () => {
    const service = new AuthService();
    const { ctx, transport } = createContext();
    service.attach(ctx);

    transport.request.mockImplementation(async (request: HttpRequest): Promise<HttpResponse<any>> => {
      expect(request.method).toBe('POST');
      expect(request.url).toBe('https://api.test/auth');
      expect(request.headers?.token).toBeUndefined();
      return {
        status: 200,
        data: {
          status: 'OK',
          result: { token: 'abc', refresh_token: 'def', expiresIn: 60 },
        },
      };
    });

    const result = await service.login({ username: 'demo', password: 'secret' });
    expect(result.token).toBe('abc');
    expect(ctx.tokenManager.getToken()).toBe('abc');
  });

  it('search.citySearch injects token header and payload', async () => {
    const service = new SearchService();
    const { ctx, transport } = createContext();
    service.attach(ctx);

    ctx.tokenManager.setToken('TOKEN');

    transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: [] } });

    await service.citySearch({ filters: { cityDescr: 'Lviv' } });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/citySearch',
        headers: expect.objectContaining({ token: 'TOKEN' }),
        body: { filters: { cityDescr: 'Lviv' } },
      }),
    );
  });

  it('parcels.create posts parcel payload and returns parsed result', async () => {
    const service = new ParcelsService();
    const { ctx, transport } = createContext();
    service.attach(ctx);
    ctx.tokenManager.setToken('TOKEN');

    const payload = {
      payType: 'cash',
      receiverPay: false,
      sender: {
        name: 'Alice',
        phone: '+380000000001',
        branchID: 'BR1',
        addressID: 'ADDR1',
        building: '10',
        service: 'Door',
      },
      receiver: {
        name: 'Bob',
        phone: '+380000000002',
        branchID: 'BR2',
        addressID: 'ADDR2',
        building: '20',
        service: 'Branch',
      },
      placesItems: [
        {
          quantity: 1,
          placeWeight: 1,
          placeVolume: 0.1,
        },
      ],
      contentsItems: [
        {
          contentName: 'Docs',
          quantity: 1,
          weight: 0.1,
          value: 10,
        },
      ],
      codPaymentsItems: [
        {
          agentId: 'AGENT',
          cod: 100,
        },
      ],
      goods: [
        {
          article: 'SKU-1',
          name: 'Sample',
          weight: 1,
          quantity: 1,
          price: 25,
        },
      ],
      cardForCOD: {
        number: '1234',
        ownername: 'John Doe',
        ownermobile: '+380111111111',
      },
    };

    transport.request.mockResolvedValue({
      status: 200,
      data: { status: 'OK', result: { parcelID: 'PID', barCode: 'BAR' } },
    });

    const result = await service.create(payload);
    expect(result.parcelID).toBe('PID');
    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/parcel',
        headers: expect.objectContaining({ token: 'TOKEN' }),
        body: expect.objectContaining({ payType: 'cash' }),
      }),
    );
  });

  it('parcels.changeContract encodes query params', async () => {
    const service = new ParcelsService();
    const { ctx, transport } = createContext();
    service.attach(ctx);
    ctx.tokenManager.setToken('TOKEN');

    transport.request.mockResolvedValue({
      status: 200,
      data: { status: 'OK', result: {} },
    });

    await service.changeContract({ barCode: 'ABC/123' }, { contractID: 'CID-1' });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.test/parcelChangeContractID?barCode=ABC%2F123',
        method: 'PUT',
      }),
    );
  });

  it('print.declaration requests binary artifacts with default responseType', async () => {
    const service = new PrintService();
    const { ctx, transport } = createContext();
    service.attach(ctx);
    ctx.tokenManager.setToken('TOKEN');

    const buffer = new ArrayBuffer(8);
    transport.request.mockResolvedValue({ status: 200, data: buffer });

    const result = await service.declaration({ printValue: '123', contentType: 'pdf' });
    expect(result).toBe(buffer);
    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.test/print/declaration/123/pdf',
        responseType: 'arraybuffer',
        headers: expect.objectContaining({ token: 'TOKEN' }),
      }),
    );
  });

  it('tracking.trackByNumber hits expected endpoint', async () => {
    const service = new TrackingService();
    const { ctx, transport } = createContext();
    service.attach(ctx);
    ctx.tokenManager.setToken('TOKEN');

    transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: [] } });

    await service.trackByNumber({ trackNumber: 'AA123456789UA' });
    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/tracking/AA123456789UA',
      }),
    );
  });

  it('misc.checkPhoneOnParcel builds encoded path', async () => {
    const service = new MiscService();
    const { ctx, transport } = createContext();
    service.attach(ctx);
    ctx.tokenManager.setToken('TOKEN');

    transport.request.mockResolvedValue({ status: 200, data: { status: 'OK', result: null } });

    await service.checkPhoneOnParcel({ barCode: 'ABC/123', phoneCheck: '+380(12)345-67-89' });
    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/CheckPhoneOnParcel/ABC%2F123/%2B380(12)345-67-89',
      }),
    );
  });
});
