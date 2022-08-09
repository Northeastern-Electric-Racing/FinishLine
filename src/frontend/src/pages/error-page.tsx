/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Container } from 'react-bootstrap';
import PageBlock from '../layouts/page-block';
import styles from '../stylesheets/pages/error-page.module.css';

interface ErrorPageProps {
  message?: string;
  error?: Error;
}

// Common page to display an error
const ErrorPage: React.FC<ErrorPageProps> = ({ message, error }) => {
  return (
    <div className={styles.text}>
      <h3>Oops, sorry!</h3>
      <h5>There was an error loading the page.</h5>
      {message ? <p>{message}</p> : ''}
      {error ? (
        <PageBlock title={'Debugging Info: '}>
          <Container>{JSON.stringify(error, Object.getOwnPropertyNames(error))}</Container>
        </PageBlock>
      ) : null}
    </div>
  );
};

export default ErrorPage;
