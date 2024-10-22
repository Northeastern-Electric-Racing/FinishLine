import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const setOrganizationImages = (images: File[]) => {
  const formData = new FormData();

  formData.append('applyInterestImage', images[0]);
  formData.append('exploreAsGuestImage', images[1]);

  return axios.post<{ message: string }>(apiUrls.organizationsSetImages(), formData, {});
};
