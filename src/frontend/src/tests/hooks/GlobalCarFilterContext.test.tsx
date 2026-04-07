/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { renderHook, render, screen, act, waitFor } from '@testing-library/react';
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
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should default to the most recent car when no saved car id in local storage', async () => {
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

    const mostRecentCar = exampleAllCars.reduce((a, b) => (a.wbsNum.carNumber > b.wbsNum.carNumber ? a : b));
    expect(result.current.selectedCar).toEqual(mostRecentCar);
    expect(localStorage.getItem('selectedCarId')).toBe(mostRecentCar.id);
  });

  it('should restore car from local storage by id', async () => {
    localStorage.setItem('selectedCarId', exampleAllCars[0].id);

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

  it('should restore "all-cars" from local storage', async () => {
    localStorage.setItem('selectedCarId', 'all-cars');

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

    expect(result.current.selectedCar).toBe('all-cars');
  });

  it('should default to most recent car when saved car id does not match any car', async () => {
    localStorage.setItem('selectedCarId', 'nonexistent-id');

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

    const mostRecentCar = exampleAllCars.reduce((a, b) => (a.wbsNum.carNumber > b.wbsNum.carNumber ? a : b));
    expect(result.current.selectedCar).toEqual(mostRecentCar);
  });

  it('should persist car id to local storage when selecting a car', async () => {
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

    expect(localStorage.getItem('selectedCarId')).toBe(exampleAllCars[1].id);
    expect(result.current.selectedCar).toEqual(exampleAllCars[1]);
  });

  it('should store "all-cars" in local storage when selecting all cars', async () => {
    localStorage.setItem('selectedCarId', exampleAllCars[0].id);

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
      result.current.setSelectedCar('all-cars');
    });

    expect(localStorage.getItem('selectedCarId')).toBe('all-cars');
    expect(result.current.selectedCar).toBe('all-cars');
  });

  it('should render a loading indicator while cars are being fetched', () => {
    mockUseGetAllCars.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    } as any);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GlobalCarFilterProvider>
          <div data-testid="children" />
        </GlobalCarFilterProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('children')).toBeNull();
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

  it('should update local storage when switching between cars', async () => {
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

    expect(localStorage.getItem('selectedCarId')).toBe(exampleAllCars[0].id);

    act(() => {
      result.current.setSelectedCar(exampleAllCars[2]);
    });

    expect(localStorage.getItem('selectedCarId')).toBe(exampleAllCars[2].id);
    expect(result.current.selectedCar).toEqual(exampleAllCars[2]);
  });
});
