import { PartTag } from 'shared/src/types/part-review.types';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { PartTagPayload } from '../hooks/part-tag.hooks';

export const getAllPartTags = async () => {
  return await axios.get<PartTag[]>(apiUrls.partTags());
};


export const createPartTag = async (payload: PartTagPayload) => {
  return await axios.post<PartTag>(apiUrls.partTagCreate(), payload);
};

/**
 * Removes a part tag with the given id
 */
export const deletePartTag = async (partTagId: string) => {
  return axios.delete<{ message: string }>(apiUrls.partTagDelete(partTagId));
};
