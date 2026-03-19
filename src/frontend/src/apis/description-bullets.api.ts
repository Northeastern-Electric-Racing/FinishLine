/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { DescriptionBullet, DescriptionBulletType, DescriptionBulletTypeCreatePayload } from 'shared';
import { apiUrls } from '../utils/urls';

/**
 * Check a single description bullet.
 */
export const checkDescriptionBullet = (userId: string, descriptionId: string) => {
  return axios.post<DescriptionBullet>(apiUrls.descriptionBulletsCheck(), {
    userId,
    descriptionId
  });
};

export const getAllDescriptionBulletTypes = () => {
  return axios.get<DescriptionBulletType[]>(apiUrls.descriptionBulletTypes());
};

export const createDescriptionBulletType = (payload: DescriptionBulletTypeCreatePayload) => {
  return axios.post<DescriptionBulletType>(apiUrls.createDescriptionBulletType(), payload);
};

export const editDescriptionBulletType = (payload: DescriptionBulletTypeCreatePayload) => {
  return axios.post<DescriptionBulletType>(apiUrls.editDescriptionBulletType(), payload);
};
