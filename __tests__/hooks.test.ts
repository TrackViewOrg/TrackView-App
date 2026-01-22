import { renderHook, act } from '@testing-library/react';
import { useSubscriptionModal } from '@/lib/hooks/subscription';

describe('useSubscriptionModal Hook', () => {
  it('should initialize with isOpen as false', () => {
    const { result } = renderHook(() => useSubscriptionModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('should set isOpen to true when open() is called', () => {
    const { result } = renderHook(() => useSubscriptionModal());
    
    act(() => {
      result.current.open();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should set isOpen to false when close() is called', () => {
    const { result } = renderHook(() => useSubscriptionModal());
    
    // First open it
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    
    // Then close it
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
