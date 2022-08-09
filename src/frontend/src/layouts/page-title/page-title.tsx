/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ReactNode } from 'react';
import { LinkItem } from '../../types';
import PageBreadcrumbs from './page-breadcrumbs/page-breadcrumbs';

interface PageTitleProps {
  title: string;
  previousPages: LinkItem[];
  actionButton?: ReactNode;
}

const styles = {
  titleText: {
    marginBottom: 0
  }
};

/**
 * Build the page title section for a page.
 * @param title The title of the page
 * @param previousPages The pages in the breadcrumb between home and the current page
 * @param actionButton The button to display on the right side of the page title
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, previousPages, actionButton }) => {
  return (
    <div className={'pt-3 mb-2 d-flex justify-content-between align-items-center'}>
      <div>
        <PageBreadcrumbs currentPageTitle={title} previousPages={previousPages} />
        <h3 style={styles.titleText}>{title}</h3>
      </div>
      <div>{actionButton}</div>
    </div>
  );
};

export default PageTitle;
