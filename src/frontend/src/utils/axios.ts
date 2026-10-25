import axiosStatic from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    overrideCarId?: string | 'all-cars';
  }
}

const axios = axiosStatic.create({
  withCredentials: import.meta.env.MODE !== 'development' ? true : undefined
});

// holds the validated car UUID in memory, set by GlobalCarFilterProvider after login.
// Storing only in memory prevents stale UUIDs from being sent
// before the car list has been loaded and validated post-login.
let currentCarId: string | null = null;
export const setCurrentCarId = (id: string | null) => {
  currentCarId = id;
};

/**
 * An error from a request to the backend, keeping the HTTP status so callers can tell a rejected
 * request (4xx) apart from the server being unreachable or down (no status, or 5xx).
 */
export class HttpError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Whether an error means the backend couldn't be reached or failed, rather than rejecting the request.
 * A load balancer 502/503 has no CORS headers, so the browser reports it as a network error with no status.
 * @param error the error thrown by a request
 * @returns true if there was no response or the response was a 5xx
 */
export const isServerUnavailableError = (error: unknown): boolean =>
  error instanceof HttpError && (error.status === undefined || error.status >= 500);

// This allows us to get good server errors
// All express responses must be: res.status(404).json({ message: "You are not authorized to do that." })
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status: number | undefined = error?.response?.status;

    // this is how normal errors get sent (e.g., res.status(400).json({message: 'blah blah'}))
    const message = error?.response?.data?.message;
    if (message) {
      throw new HttpError(message, status);
    }

    // this is how validation errors get sent
    const errors = error?.response?.data?.errors;
    if (errors) {
      let messages = 'ERRORS:';
      errors.forEach((element: { msg: string; value: string; param: string; location: string }) => {
        const errorMessage = `\n${element.msg}: ${element.value} for "${element.param}" in ${element.location}`;
        messages += errorMessage;
      });
      throw new HttpError(messages, status);
    }

    throw new HttpError('Unknown Error!' + error.message, status);
  }
);

axios.interceptors.request.use(
  (request) => {
    if (import.meta.env.MODE === 'development') request.headers!['Authorization'] = localStorage.getItem('devUserId') || '';
    const organizationId = localStorage.getItem('organizationId');
    request.headers!['organizationId'] = organizationId ?? '';
    if (request.overrideCarId !== undefined) {
      if (request.overrideCarId !== 'all-cars') request.headers!['carId'] = request.overrideCarId;
    } else if (currentCarId) {
      request.headers!['carId'] = currentCarId;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
