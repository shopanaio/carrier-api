import { TokenManager } from '../src/core/tokenManager';

describe('TokenManager', () => {
  it('should initialize with undefined token', () => {
    const manager = new TokenManager();
    expect(manager.getToken()).toBeUndefined();
  });

  it('should initialize with provided token', () => {
    const manager = new TokenManager('initial-token');
    expect(manager.getToken()).toBe('initial-token');
  });

  it('should set and retrieve token', () => {
    const manager = new TokenManager();
    manager.setToken('new-token');
    expect(manager.getToken()).toBe('new-token');
  });

  it('should clear token', () => {
    const manager = new TokenManager('some-token');
    expect(manager.getToken()).toBe('some-token');
    manager.clearToken();
    expect(manager.getToken()).toBeUndefined();
  });

  it('should notify listener on token change', () => {
    const listener = jest.fn();
    const manager = new TokenManager(undefined, listener);

    manager.setToken('token-1');
    expect(listener).toHaveBeenCalledWith('token-1');
    expect(listener).toHaveBeenCalledTimes(1);

    manager.setToken('token-2');
    expect(listener).toHaveBeenCalledWith('token-2');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should notify listener on clear', () => {
    const listener = jest.fn();
    const manager = new TokenManager('initial', listener);

    manager.clearToken();
    expect(listener).toHaveBeenCalledWith(undefined);
  });

  it('should support multiple subscribers', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const manager = new TokenManager();

    manager.subscribe(listener1);
    manager.subscribe(listener2);

    manager.setToken('new-token');

    expect(listener1).toHaveBeenCalledWith('new-token');
    expect(listener2).toHaveBeenCalledWith('new-token');
  });

  it('should unsubscribe listener', () => {
    const listener = jest.fn();
    const manager = new TokenManager();

    const unsubscribe = manager.subscribe(listener);
    manager.setToken('token-1');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    manager.setToken('token-2');
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should handle multiple unsubscribes safely', () => {
    const listener = jest.fn();
    const manager = new TokenManager();

    const unsubscribe = manager.subscribe(listener);
    unsubscribe();
    unsubscribe(); // Should not throw

    manager.setToken('token');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should notify initial listener immediately on construction', () => {
    const listener = jest.fn();
    const manager = new TokenManager('initial-token', listener);

    // Listener is registered but not called on construction
    expect(listener).not.toHaveBeenCalled();

    manager.setToken('new-token');
    expect(listener).toHaveBeenCalledWith('new-token');
  });

  it('should handle setting undefined token', () => {
    const listener = jest.fn();
    const manager = new TokenManager('token', listener);

    manager.setToken(undefined);
    expect(manager.getToken()).toBeUndefined();
    expect(listener).toHaveBeenCalledWith(undefined);
  });
});
