/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import styles from './page-not-found.module.css';
/**
 * A display for when the project reaches an unknown page.
 * @returns page containing error message.
 */
export const PageNotFound: React.FC = () => {
  return (
    <div className={`pt-5 ${styles.page_not_found}`}>
      <h1 className={styles.title}>404</h1>
      <h3 className={styles.subtitle}>Page not found</h3>
    </div>
  );
};
