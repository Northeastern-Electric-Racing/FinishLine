import { default as axiosStatic } from 'axios';

const axios = axiosStatic.create({
  withCredentials: import.meta.env.MODE !== 'development' ? true : undefined
});

// This allows us to get good server errors
// All express responses must be: res.status(404).json({ message: "You are not authorized to do that." })
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // this is how normal errors get sent (e.g., res.status(400).json({message: 'blah blah'}))
    const message = error?.response?.data?.message;
    if (message) {
      throw new Error(message);
    }

    // this is how validation errors get sent
    const errors = error?.response?.data?.errors;
    if (errors) {
      let messages = 'ERRORS:';
      errors.forEach((element: { msg: string; value: string; param: string; location: string }) => {
        const errorMessage = `\n${element.msg}: ${element.value} for "${element.param}" in ${element.location}`;
        messages += errorMessage;
      });
      throw new Error(messages);
    }

    throw new Error('Unknown Error!');
  }
);

axios.interceptors.request.use(
  (request) => {
    if (import.meta.env.MODE === 'development') request.headers!['Authorization'] = localStorage.getItem('devUserId') || '';
    const organizationId = localStorage.getItem('organizationId');
    request.headers!['organizationId'] = organizationId ?? '';
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
