/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faScroll } from '@fortawesome/free-solid-svg-icons';
import { render, screen, fireEvent } from '../../test-support/test-utils';
import ExternalLink from './external-link';

const TEST_DESCRIPTION = 'test';
const TEST_LINK = 'github.com';

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  return render(<ExternalLink icon={faScroll} link={TEST_LINK} description={TEST_DESCRIPTION} />);
};

describe('external link', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders description', () => {
    renderComponent();
    expect(screen.getByText(TEST_DESCRIPTION)).toBeInTheDocument();
  });

  it('is clickable', async () => {
    renderComponent();
    await fireEvent.click(screen.getByText(TEST_DESCRIPTION));
  });

  it('has icon', () => {
    renderComponent();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'scroll');
  });

  it('has correct href', () => {
    renderComponent();
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('href', TEST_LINK);
  });

  it('has correct target', () => {
    renderComponent();
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('target', '_blank');
  });

  it('has correct rel', () => {
    renderComponent();
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
