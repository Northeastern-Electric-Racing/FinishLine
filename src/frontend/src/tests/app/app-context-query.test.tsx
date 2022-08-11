/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react'; // avoid circular dependency
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import AppContextQuery from '../../app/app-context-query';

describe('app context', () => {
  it('renders simple text as children', () => {
    render(<AppContextQuery>hello</AppContextQuery>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('properly provider query client', () => {
    const TestComponent = () => {
      const result = useAllChangeRequests();
      return <p>{result.status}</p>;
    };
    render(
      <AppContextQuery>
        <TestComponent />
      </AppContextQuery>
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });
});
