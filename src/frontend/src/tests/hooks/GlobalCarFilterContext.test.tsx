/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GlobalCarFilterProvider, useGlobalCarFilter } from '../../app/AppGlobalCarFilterContext';
import * as carsHooks from '../../hooks/cars.hooks';
import { exampleAllCars } from '../test-support/test-data/cars.stub';

// Mock the hooks
vi.mock('../../hooks/cars.hooks');
const mockUseGetAllCars = vi.mocked(carsHooks.useGetAllCars);

// Create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <GlobalCarFilterProvider>{children}</GlobalCarFilterProvider>
    </QueryClientProvider>
  );
};

describe('useGlobalCarFilter', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null when no saved car name in session storage', async () => {
    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedCar).toBeNull();
    expect(result.current.allCars).toEqual(exampleAllCars);
  });

  it('should restore car from session storage by name', async () => {
    sessionStorage.setItem('selectedCarName', exampleAllCars[0].name);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toEqual(exampleAllCars[0]);
    });
  });

  it('should default to null when saved car name does not match any car', async () => {
    sessionStorage.setItem('selectedCarName', 'NER-Nonexistent');

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedCar).toBeNull();
  });

  it('should persist car name to session storage when selecting a car', async () => {
    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSelectedCar(exampleAllCars[1]);
    });

    expect(sessionStorage.getItem('selectedCarName')).toBe(exampleAllCars[1].name);
    expect(result.current.selectedCar).toEqual(exampleAllCars[1]);
  });

  it('should clear session storage when selecting null (all cars)', async () => {
    sessionStorage.setItem('selectedCarName', exampleAllCars[0].name);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toEqual(exampleAllCars[0]);
    });

    act(() => {
      result.current.setSelectedCar(null);
    });

    expect(sessionStorage.getItem('selectedCarName')).toBeNull();
    expect(result.current.selectedCar).toBeNull();
  });

  it('should handle loading state', () => {
    mockUseGetAllCars.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.selectedCar).toBeNull();
  });

  it('should handle error state', () => {
    const error = new Error('Failed to load cars');

    mockUseGetAllCars.mockReturnValue({
      data: undefined,
      isLoading: false,
      error
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('should update session storage when switching between cars', async () => {
    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSelectedCar(exampleAllCars[0]);
    });

    expect(sessionStorage.getItem('selectedCarName')).toBe(exampleAllCars[0].name);

    act(() => {
      result.current.setSelectedCar(exampleAllCars[2]);
    });

    expect(sessionStorage.getItem('selectedCarName')).toBe(exampleAllCars[2].name);
    expect(result.current.selectedCar).toEqual(exampleAllCars[2]);
  });
});
