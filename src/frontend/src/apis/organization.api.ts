import axios from "axios";
import { apiUrls } from "../utils/urls";

export const setOrganizationImages = (images: File[]) => {
    return axios.post<{ message: string }>(apiUrls.organizationsSetImages(), {
      images
    });
  };