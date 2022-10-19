import { default as axiosStatic } from 'axios';

const axios = axiosStatic.create({
  withCredentials: true
});

/* 
  The below is required if you want your API to return 
  server message errors. Otherwise, you'll just get 
  generic status errors.
  
  res.status(404).json({ message: "You are not authorized to do that." })
*/
axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response.data.message)
);

export default axios;
