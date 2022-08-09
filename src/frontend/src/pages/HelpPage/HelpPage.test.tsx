/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { routes } from '../../routes';
import HelpPage from './HelpPage';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({ path: routes.HELP, route: routes.HELP });
  return render(
    <RouterWrapper>
      <HelpPage />
    </RouterWrapper>
  );
};

describe('help page component', () => {
  it('renders title', () => {
    renderComponent();
    expect(screen.getAllByText('Help').length).toEqual(2);
  });

  it('renders resources section', () => {
    renderComponent();
    expect(screen.getByText(/Resources/)).toBeInTheDocument();
    expect(screen.getByText(/Glossary/)).toBeInTheDocument();
  });

  it('renders support section', () => {
    renderComponent();
    expect(screen.getByText(/Support/)).toBeInTheDocument();
    expect(screen.getByText(/Message in Slack/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
  });
});
