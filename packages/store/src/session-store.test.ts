import { useSessionStore } from './index';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ isAuthenticated: false });
  });

  it('stores client session state', () => {
    useSessionStore.getState().setAuthenticated(true);

    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });
});
