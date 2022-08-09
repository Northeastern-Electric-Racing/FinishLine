/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import AppMain from './app/app-main/app-main';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './custom.scss';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/error-boundary/error-boundary';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppMain />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
