import { default as axiosStatic } from 'axios';

const axios = axiosStatic.create({
  withCredentials: true
});

export default axios;
