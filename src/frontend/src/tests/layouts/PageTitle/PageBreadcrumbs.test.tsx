/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, routerWrapperBuilder, screen } from '../../test-support/test-utils';
import PageBreadcrumbs from '../../../layouts/PageTitle/PageBreadcrumbs';
import { LinkItem } from '../../../utils/types';
import { Home } from '@mui/icons-material';

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
  it('renders provided pages', () => {
    renderComponent('hello there', [
      {
        name: 'Home',
        icon: <Home />,
        route: '/'
      },
      {
        name: 'Projects',
        route: '/projects'
      },
      {
        name: 'Change Requests',
        route: '/change-requests'
      }
    ]);

    expect(screen.getByText('hello there')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toEqual(1);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
  });
});
