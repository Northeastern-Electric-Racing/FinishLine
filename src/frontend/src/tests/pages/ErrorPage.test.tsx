/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render } from '@testing-library/react';
import ErrorPage from '../../pages/ErrorPage';

describe('error page', () => {
  it('renders everything', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('Oops, sorry!')).toBeInTheDocument();
    expect(getByText('There was an error loading the page.')).toBeInTheDocument();
  });
});
