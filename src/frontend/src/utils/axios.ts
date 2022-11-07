import { default as axiosStatic } from 'axios';

const axios = axiosStatic.create({
  withCredentials: process.env.NODE_ENV !== 'development' ? true : undefined
});

// This allows us to get good server errors
// All express responses must be: res.status(404).json({ message: "You are not authorized to do that." })
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error?.response?.data?.message || 'Something went wrong...';
    throw new Error(message);
  }
);

export default axios;
