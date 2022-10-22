/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render } from '@testing-library/react';
import LoadingIndicator from '../../components/LoadingIndicator';

describe('loading indicator', () => {
  it('renders without error', () => {
    render(<LoadingIndicator />);
  });
});
