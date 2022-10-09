/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import styles from '../stylesheets/pages/TeamsPage.module.css';

const TeamsPage: React.FC = () => {
  return (
    <div className={`pt-5 ${styles.page_not_found}`}>
      <h1 className={styles.title}>Uh Oh</h1>
      <h3 className={styles.subtitle}>This page is still under development</h3>
      <h5 className={styles.subtitle}>Check back soon!</h5>
    </div>
  );
};

export default TeamsPage;
