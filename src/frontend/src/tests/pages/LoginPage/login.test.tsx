/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { routes } from '../../../routes';
import Login from '../../../pages/LoginPage/login';

let pushed: string[] = [];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const TestComponent = () => {
    const history = useHistory();
    history.listen((loc) => {
      pushed.push(loc.pathname);
    });
    return <Login postLoginRedirect={{ url: routes.HOME, search: '' }} />;
  };
  const RouterWrapper = routerWrapperBuilder({ path: routes.LOGIN, route: routes.LOGIN });
  return render(
    <RouterWrapper>
      <TestComponent />
    </RouterWrapper>
  );
};

describe('login component', () => {
  afterEach(() => {
    pushed = [];
  });

  it('renders title', () => {
    renderComponent();
    expect(screen.getByText(/NER PM Dashboard/i)).toBeInTheDocument();
    expect(pushed).toEqual([]);
  });

  it('renders help text', () => {
    renderComponent();
    expect(screen.getByText(/Login Required/i)).toBeInTheDocument();
    expect(pushed).toEqual([]);
  });
});
