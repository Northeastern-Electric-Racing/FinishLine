/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../test-support/test-utils';
import { routes } from '../../utils/routes';
import InfoPage from '../../pages/InfoPage';
import * as userHooks from '../../hooks/users.hooks';
import { exampleAdminUser } from '../test-support/test-data/users.stub';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.INFO, route: routes.INFO });
  return render(
    <RouterWrapper>
      <InfoPage />
    </RouterWrapper>
  );
};

describe('help page component', () => {
  it('renders everything', () => {
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAdminUser);
    renderComponent();
    expect(screen.getAllByText('Information').length).toEqual(1);
    expect(screen.getByText(/Resources/)).toBeInTheDocument();
    expect(screen.getByText(/Glossary/)).toBeInTheDocument();
    expect(screen.getByText(/Support/)).toBeInTheDocument();
    expect(screen.getByText(/Message in Slack/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
  });
});
