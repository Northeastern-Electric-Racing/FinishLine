/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../test-support/test-utils';
import UsefulLinks from './useful-links';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  return render(<UsefulLinks />);
};

describe('useful links component', () => {
  it('renders headers', () => {
    renderComponent();
    expect(screen.getByText(/Useful Links/i)).toBeInTheDocument();
  });

  it('renders links', () => {
    renderComponent();
    expect(screen.getByText(/Purchasing Guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/Procurement Form/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Guidelines/i).length).toEqual(4);
  });
});
