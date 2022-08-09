/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react'; // avoid circular dependency
import AppContextAuth from '../../app/app-context-auth';
import { useAuth } from '../../services/auth.hooks';
import AppContextQuery from '../../app/app-context-query';

describe('app context auth', () => {
  it('renders simple text as children', () => {
    render(
      <AppContextQuery>
        <AppContextAuth>hello</AppContextAuth>
      </AppContextQuery>
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('provides the auth object to child components', () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <p>test: {auth.user === undefined}</p>;
    };
    render(
      <AppContextQuery>
        <AppContextAuth>
          <TestComponent />
        </AppContextAuth>
      </AppContextQuery>
    );
    expect(screen.getByText('test:')).toBeInTheDocument();
  });
});
