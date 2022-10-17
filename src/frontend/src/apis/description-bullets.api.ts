/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from 'axios';
import { DescriptionBullet } from 'shared';
import { apiUrls } from '../utils/Urls';

/**
 * Check a single description bullet.
 */
export const checkDescriptionBullet = (userId: number, descriptionId: number) => {
  return axios.post<DescriptionBullet>(apiUrls.descriptionBulletsCheck(), {
    userId,
    descriptionId
  });
};
