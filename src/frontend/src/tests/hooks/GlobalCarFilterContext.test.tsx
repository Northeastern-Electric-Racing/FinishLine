/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GlobalCarFilterProvider, useGlobalCarFilter } from '../../app/AppGlobalCarFilterContext';
import * as carsHooks from '../../hooks/cars.hooks';
import { exampleAllCars, exampleCurrentCar } from '../test-support/test-data/cars.stub';

// Mock the hooks
vi.mock('../../hooks/cars.hooks');
const mockUseGetCurrentCar = vi.mocked(carsHooks.useGetCurrentCar);
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
    // Clear session storage
    sessionStorage.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize with current car when available', async () => {
    mockUseGetCurrentCar.mockReturnValue({
      data: exampleCurrentCar,
      isLoading: false,
      error: null
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toEqual(exampleCurrentCar);
    });

    expect(result.current.allCars).toEqual(exampleAllCars);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with most recent car when no current car', async () => {
    mockUseGetCurrentCar.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toEqual(exampleAllCars[2]); // Car 2025 has highest car number
    });
  });

  it('should restore car from session storage', async () => {
    // Set session storage
    sessionStorage.setItem('selectedCarId', exampleAllCars[0].id);

    mockUseGetCurrentCar.mockReturnValue({
      data: exampleCurrentCar,
      isLoading: false,
      error: null
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toEqual(exampleAllCars[0]); // Car 2023
    });
  });

  it('should persist car selection to session storage', async () => {
    mockUseGetCurrentCar.mockReturnValue({
      data: exampleCurrentCar,
      isLoading: false,
      error: null
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toBeTruthy();
    });

    // Change selection
    result.current.setSelectedCar(exampleAllCars[1]);

    expect(sessionStorage.getItem('selectedCarId')).toBe(exampleAllCars[1].id);
  });

  it('should handle loading state', () => {
    mockUseGetCurrentCar.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    } as any);

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

    mockUseGetCurrentCar.mockReturnValue({
      data: undefined,
      isLoading: false,
      error
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear session storage when setting car to null', async () => {
    mockUseGetCurrentCar.mockReturnValue({
      data: exampleCurrentCar,
      isLoading: false,
      error: null
    } as any);

    mockUseGetAllCars.mockReturnValue({
      data: exampleAllCars,
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useGlobalCarFilter(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.selectedCar).toBeTruthy();
    });

    // Clear selection
    result.current.setSelectedCar(null);

    await waitFor(() => {
      expect(sessionStorage.getItem('selectedCarId')).toBeNull();
      expect(result.current.selectedCar).toBeNull();
    });
  });
});
