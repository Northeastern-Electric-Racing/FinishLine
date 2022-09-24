/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../TestSupport/TestUtils';
import { routes } from '../../utils/Routes';
import InfoPage from '../../pages/InfoPage';

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
  it('renders title', () => {
    renderComponent();
    expect(screen.getAllByText('Information').length).toEqual(2);
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

  it('renders calendars section', () => {
    renderComponent();
    expect(screen.getByText(/Calendars/)).toBeInTheDocument();
    expect(screen.getAllByText(/Public URL/).length).toEqual(6);
    expect(screen.getAllByText(/iCal URL/).length).toEqual(6);
    expect(screen.getByText(/Club-Wide Meetings & Events/)).toBeInTheDocument();
    expect(screen.getByText(/Electrical Meetings/)).toBeInTheDocument();
    expect(screen.getByText(/Mechanical Meetings/)).toBeInTheDocument();
    expect(screen.getByText(/Business Meetings/)).toBeInTheDocument();
    expect(screen.getByText(/Software Meetings/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering Reviews/)).toBeInTheDocument();
  });
});
