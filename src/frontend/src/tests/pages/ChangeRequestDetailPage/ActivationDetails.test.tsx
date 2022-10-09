/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { ActivationChangeRequest } from 'shared';
import { useTheme } from '../../../hooks/Theme.hooks';
import { datePipe } from '../../../utils/Pipes';
import themes from '../../../utils/Themes';
import { Theme } from '../../../utils/Types';
import { exampleActivationChangeRequest } from '../../TestSupport/TestData/ChangeRequests.stub';
import ActivationDetails from '../../../pages/ChangeRequestDetailPage/ActivationDetails';

jest.mock('../../../hooks/Theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (cr: ActivationChangeRequest) => {
  return render(<ActivationDetails cr={cr} />);
};

describe('Change request details activation cr display element tests', () => {
  beforeEach(() => mockHook());

  const cr: ActivationChangeRequest = exampleActivationChangeRequest;

  it('Renders project lead', () => {
    renderComponent(cr);
    expect(screen.getByText(`Project Lead`)).toBeInTheDocument();
    expect(
      screen.getByText(`${cr.projectLead.firstName} ${cr.projectLead.lastName}`)
    ).toBeInTheDocument();
  });

  it('Renders project manager', () => {
    renderComponent(cr);
    expect(screen.getByText(`Project Manager`)).toBeInTheDocument();
    expect(
      screen.getByText(`${cr.projectManager.firstName} ${cr.projectManager.lastName}`)
    ).toBeInTheDocument();
  });

  it('Renders start date', () => {
    renderComponent(cr);
    expect(screen.getByText(`Start Date`)).toBeInTheDocument();
    expect(screen.getByText(`${datePipe(cr.startDate)}`)).toBeInTheDocument();
  });

  it('Renders confirm details', () => {
    renderComponent(cr);
    expect(screen.getByText(`Confirm WP Details`)).toBeInTheDocument();
    expect(screen.getByText(`${cr.confirmDetails ? 'YES' : 'NO'}`)).toBeInTheDocument();
  });
});
