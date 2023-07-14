/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import { testLinkItems } from '../../test-support/test-data/test-utils.stub';
import { MUILinkItem } from '../../../utils/types';
import PageBreadcrumbs from '../../../layouts/PageTitle/PageBreadcrumbs';

// Render component under test
const renderComponent = (title = 'test', pages: MUILinkItem[] = []) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <PageBreadcrumbs currentPageTitle={title} previousPages={pages} />
    </RouterWrapper>
  );
};

describe('page-breadcrumbs component', () => {
  it('renders provided pages', () => {
    renderComponent('hello there', testLinkItems);

    expect(screen.getByText('hello there')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toEqual(1);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });
});
