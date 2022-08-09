/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { LinkItem } from '../../../types';
import { routes } from '../../../routes';
import styles from './page-breadcrumbs.module.css';

interface PageTitleProps {
  currentPageTitle: string;
  previousPages: LinkItem[];
}

// Common component for adding breadcrumbs to a page
const PageBreadcrumbs: React.FC<PageTitleProps> = ({ currentPageTitle, previousPages }) => {
  return (
    <Breadcrumb className={styles.breadcrumbs}>
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: routes.HOME }}>
        Home
      </Breadcrumb.Item>
      {previousPages.map((page) => (
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: page.route }}>
          {page.name}
        </Breadcrumb.Item>
      ))}
      <Breadcrumb.Item active>{currentPageTitle}</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export default PageBreadcrumbs;
