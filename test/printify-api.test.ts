import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared mock fns for the Printify SDK, hoisted so the vi.mock factory below can
// reference them (vi.mock is hoisted above imports).
const { mockShopsList, mockProductsList } = vi.hoisted(() => ({
  mockShopsList: vi.fn(),
  mockProductsList: vi.fn(),
}));

// sharp is a native dep pulled in when printify-api loads; irrelevant to these tests.
vi.mock('sharp', () => ({ default: vi.fn() }));

// Drive the REAL PrintifyAPI against a controllable fake SDK, so we exercise the
// actual fetch -> retry -> fabricate-or-throw decision (not a mocked shim).
vi.mock('printify-sdk-js', () => ({
  default: class MockPrintify {
    shops = { list: mockShopsList };
    products = { list: mockProductsList, getOne: vi.fn() };
    constructor(_opts: unknown) {}
  },
}));

import { PrintifyAPI } from '../src/printify-api';
import { getPrintifyStatus } from '../src/services/printify-shops';

describe('PrintifyAPI — never fabricate mock shops on a failed shops-fetch (regression: mock-shop bug)', () => {
  beforeEach(() => {
    mockShopsList.mockReset();
    mockProductsList.mockReset();
  });

  it('initialize() surfaces the REAL error and fabricates nothing when shops.list fails with no configured shop ID', async () => {
    mockShopsList.mockRejectedValue(new Error('ECONNRESET: connection reset by peer'));

    const api = new PrintifyAPI('test_token', undefined, { retryAttempts: 3, retryBaseDelayMs: 0 });

    await expect(api.initialize()).rejects.toThrow(/Failed to fetch shops from Printify/);
    // The bug: it used to return [{id:10001,'Mock Shop 1'},{id:10002,...}] and set 10001 as default.
    expect(api.getAvailableShops()).toEqual([]);
    expect(api.getCurrentShopId()).toBeNull();
    expect(api.isConnected()).toBe(false);
    // Bounded retry actually retried before giving up.
    expect(mockShopsList).toHaveBeenCalledTimes(3);
  });

  it('initialize() retries a transient failure, then succeeds with the REAL shop (the restart case that bit kev)', async () => {
    mockShopsList
      .mockRejectedValueOnce(new Error('503 Service Unavailable (transient)'))
      .mockResolvedValueOnce([
        { id: 12345, title: 'Test Shop', sales_channel: 'custom_integration' },
      ]);

    const api = new PrintifyAPI('test_token', undefined, { retryAttempts: 3, retryBaseDelayMs: 0 });

    const shops = await api.initialize();
    expect(shops).toHaveLength(1);
    expect(shops[0].title).toBe('Test Shop');
    expect(api.getCurrentShopId()).toBe('12345');
    expect(api.isConnected()).toBe(true);
    expect(mockShopsList).toHaveBeenCalledTimes(2);
  });

  it('getShops() throws on API failure instead of returning fabricated/stale mock shops', async () => {
    mockShopsList.mockRejectedValue(new Error('401 Unauthorized'));

    const api = new PrintifyAPI('test_token', 'known-shop-1', { retryAttempts: 1, retryBaseDelayMs: 0 });

    await expect(api.getShops()).rejects.toThrow(/401 Unauthorized/);
    expect(api.isConnected()).toBe(false);
  });

  it('getProducts() throws on API failure instead of returning a fake-empty { data: [] }', async () => {
    mockShopsList.mockResolvedValue([
      { id: 12345, title: 'Test Shop', sales_channel: 'custom_integration' },
    ]);
    mockProductsList.mockRejectedValue(new Error('500 Internal Server Error'));

    const api = new PrintifyAPI('test_token', undefined, { retryAttempts: 1, retryBaseDelayMs: 0 });
    await api.initialize(); // sets shopId from the real shop

    await expect(api.getProducts()).rejects.toThrow(/500 Internal Server Error/);
  });
});

describe('getPrintifyStatus — Connected reflects a real successful call (regression: false "Connected: Yes")', () => {
  beforeEach(() => {
    mockShopsList.mockReset();
  });

  it('reports Connected: No with the real reason when the API call fails — never a false Yes', async () => {
    mockShopsList.mockRejectedValue(new Error('401 Unauthorized'));
    const api = new PrintifyAPI('test_token', 'shop-1', { retryAttempts: 1, retryBaseDelayMs: 0 });

    const result = await getPrintifyStatus(api);
    const text: string = result.response?.content?.[0]?.text ?? '';

    expect(text).toContain('Connected: No');
    expect(text).not.toContain('Connected: Yes');
    expect(text).toContain('401 Unauthorized');
    expect(api.isConnected()).toBe(false);
  });

  it('reports Connected: Yes only after a real successful call', async () => {
    mockShopsList.mockResolvedValue([
      { id: 12345, title: 'Test Shop', sales_channel: 'custom_integration' },
    ]);
    const api = new PrintifyAPI('test_token', undefined, { retryAttempts: 1, retryBaseDelayMs: 0 });
    await api.initialize();

    const result = await getPrintifyStatus(api);
    const text: string = result.response?.content?.[0]?.text ?? '';

    expect(text).toContain('Connected: Yes');
    expect(text).toContain('Test Shop');
    expect(api.isConnected()).toBe(true);
  });
});
