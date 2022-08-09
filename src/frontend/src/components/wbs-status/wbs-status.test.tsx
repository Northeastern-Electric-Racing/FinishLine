/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from 'shared';
import { render, screen } from '../../test-support/test-utils';
import WbsStatus from './wbs-status';

const TEST_CLASS = 'badge badge-pill badge-';

// Sets up the component under test with the desired values and renders it.
const renderComponent = (status = WbsElementStatus.Active) => {
  return render(<WbsStatus status={status} />);
};

describe('wbs status', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders status text', () => {
    renderComponent();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('has correct variant', () => {
    renderComponent();
    expect(screen.getByText('Active')).toHaveClass(TEST_CLASS + 'primary');
  });

  it('has correct inactive variant', () => {
    renderComponent(WbsElementStatus.Inactive);
    expect(screen.getByText('Inactive')).toHaveClass(TEST_CLASS + 'secondary');
  });

  it('has correct complete variant', () => {
    renderComponent(WbsElementStatus.Complete);
    expect(screen.getByText('Complete')).toHaveClass(TEST_CLASS + 'success');
  });
});
