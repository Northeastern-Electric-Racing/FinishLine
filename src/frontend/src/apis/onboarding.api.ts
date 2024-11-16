import { Checklist } from "shared";
import axios from "../utils/axios";
import { apiUrls } from "../utils/urls";

export const getAllChecklists = () => {
    return axios.get<Checklist[]>(apiUrls.allChecklists(), {
      transformResponse: (data) => JSON.parse(data)
    });
  };