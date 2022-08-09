/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render } from '@testing-library/react';
import ErrorPage from './error-page';

describe('error page', () => {
  it('renders without error', () => {
    render(<ErrorPage />);
  });

  it('renders title', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('There was an error loading the page.')).toBeInTheDocument();
  });

  it('does not render message when not provided', () => {
    const { queryByText } = render(<ErrorPage />);

    expect(queryByText('sample message')).not.toBeInTheDocument();
  });

  it('renders message when provided', () => {
    const { getByText } = render(<ErrorPage message={'sample message'} />);

    expect(getByText('sample message')).toBeInTheDocument();
  });
});
