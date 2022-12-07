/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faScroll } from '@fortawesome/free-solid-svg-icons';
import { render, screen, fireEvent } from '../test-support/test-utils';
import ExternalLink from '../../components/ExternalLink';

const TEST_DESCRIPTION = 'test';
const TEST_LINK = 'github.com';

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  return render(<ExternalLink icon={faScroll} link={TEST_LINK} description={TEST_DESCRIPTION} />);
};

describe('external link', () => {
  it('has correct href', () => {
    renderComponent();
    expect(screen.getByText(TEST_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'scroll');
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('href', TEST_LINK);
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('target', '_blank');
    expect(screen.getByText(TEST_DESCRIPTION)).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(screen.getByText(TEST_DESCRIPTION)); // is clickable
  });
});
