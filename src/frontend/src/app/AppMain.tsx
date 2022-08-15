/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BrowserRouter } from 'react-router-dom';
import AppContext from './AppContext';
import AppPublic from './AppPublic';

const AppMain: React.FC = () => {
  return (
    <AppContext>
      <BrowserRouter>
        <AppPublic />
      </BrowserRouter>
    </AppContext>
  );
};

export default AppMain;
