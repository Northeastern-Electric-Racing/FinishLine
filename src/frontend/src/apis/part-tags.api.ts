import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const getAllPartTags = async () => {
  return await axios.get<PartTag[]>(apiUrls.partTags());
};

export const createPartTag = async (payload: CreatePartTagPayload) => {
  return await axios.post<PartTag>(apiUrls.partTagsCreate(), payload);
};
