/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from 'axios';
import { apiUrls } from '../utils/Urls';

/**
 * Fetches the version number of the app.
 */
export const getReleaseInfo = () => {
  return axios.get(apiUrls.version(), {
    transformResponse: (response) => JSON.parse(response)
  });
};
