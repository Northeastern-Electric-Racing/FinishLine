/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from 'axios';
import { apiUrls } from '../utils/Urls';

/**
 * Fetches the version number of the app.
 */
export const getVersionNumber = () => {
  return axios.get(apiUrls.version(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
