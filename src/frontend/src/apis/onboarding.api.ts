import axios from 'axios';
import { apiUrls } from '../utils/urls';

/**
 * API Call to download a google image
 * @param fileId file id to be downloaded
 * @returns an image blob
 */
export const downloadGoogleImage = async (fileId: string): Promise<Blob> => {
  const response = await axios.get(apiUrls.imageById(fileId), {
    responseType: 'arraybuffer' // Set the response type to 'arraybuffer' to receive the image as a Buffer
  });
  console.log('ID IN API:', fileId);
  const imageBuffer = new Uint8Array(response.data);
  const imageBlob = new Blob([imageBuffer], { type: response.headers['content-type'] });
  return imageBlob;
};
