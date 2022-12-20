/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import CreateProjectFormView from '../../../pages/CreateProjectPage/CreateProjectFormView';
import { useQuery } from '../../../hooks/utils.hooks';

jest.mock('../../../hooks/utils.hooks');

const mockedUseQuery = useQuery as jest.Mock<URLSearchParams>;

const mockUseQuery = () => {
  mockedUseQuery.mockReturnValue(new URLSearchParams(''));
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (allowSubmit = true) => {
  return render(<CreateProjectFormView onCancel={() => null} onSubmit={() => null} allowSubmit={allowSubmit} />);
};

describe('create project form view test suite', () => {
  it('renders buttons', () => {
    mockUseQuery();
    renderComponent();

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables submit button when allowSubmit is false', () => {
    mockUseQuery();
    renderComponent(false);

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button when allowSubmit is true', () => {
    mockUseQuery();
    renderComponent(true);

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
