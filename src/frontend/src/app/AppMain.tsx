/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BrowserRouter } from 'react-router-dom';
import AppContext from './AppContext';
import AppPublic from './AppPublic';
import { ToastProvider } from '../components/Toast/ToastProvider';

const AppMain: React.FC = () => {
  return (
    <AppContext>
      <ToastProvider>
        <BrowserRouter>
          <AppPublic />
        </BrowserRouter>
      </ToastProvider>
    </AppContext>
  );
};

export default AppMain;
