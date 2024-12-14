import axios from 'axios';

export const getDefaultImageData = async () => {
  const { data } = await axios.get('/default-logo.png', {
    responseType: 'blob'
  });
  return data;
};
