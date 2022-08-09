/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { PageNotFound } from '../../pages/page-not-found';

test('404 rendered', () => {
  render(<PageNotFound />);
  const title = screen.getByText(/404/i);
  expect(title).toBeInTheDocument();
});
