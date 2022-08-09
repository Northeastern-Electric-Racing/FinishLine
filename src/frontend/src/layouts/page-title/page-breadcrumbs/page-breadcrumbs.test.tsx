/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../../test-support/test-utils';
import { testLinkItems } from '../../../test-support/test-data/test-utils.stub';
import { LinkItem } from '../../../types';
import PageBreadcrumbs from './page-breadcrumbs';

// Render component under test
const renderComponent = (title = 'test', pages: LinkItem[] = []) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <PageBreadcrumbs currentPageTitle={title} previousPages={pages} />
    </RouterWrapper>
  );
};

describe('page-breadcrumbs component', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders current page', () => {
    renderComponent();

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders home by default', () => {
    renderComponent();

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders provided pages', () => {
    renderComponent('hello there', testLinkItems);

    expect(screen.getByText('hello there')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toEqual(2);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });
});
