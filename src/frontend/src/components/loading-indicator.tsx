/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import styles from '../stylesheets/components/loading-indicator.module.css';

// Classic red square spinning loading indicator
const LoadingIndicator: React.FC = () => {
  return (
    <div className={styles.loaderWrapper}>
      <span className={styles.loader} data-testid={'loader'}>
        <span className={styles.loaderInner}></span>
      </span>
    </div>
  );
};

export default LoadingIndicator;
