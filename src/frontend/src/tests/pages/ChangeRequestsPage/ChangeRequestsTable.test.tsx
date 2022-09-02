/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { UseQueryResult } from 'react-query';
import { ChangeRequest } from 'shared';
import { exampleAllChangeRequests } from '../../TestSupport/TestData/ChangeRequests.stub';
import { mockUseQueryResult } from '../../TestSupport/TestData/TestUtils.stub';
import { useAllChangeRequests } from '../../../hooks/ChangeRequests.hooks';
import { routerWrapperBuilder } from '../../TestSupport/TestUtils';
import { fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import ChangeRequestsTable from '../../../pages/ChangeRequestsPage/ChangeRequestsTable';

jest.mock('../../../hooks/ChangeRequests.hooks');

const mockedUseAllChangeRequests = useAllChangeRequests as jest.Mock<
  UseQueryResult<ChangeRequest[]>
>;

const mockHook = (isLoading: boolean, isError: boolean, data?: ChangeRequest[], error?: Error) => {
  mockedUseAllChangeRequests.mockReturnValue(
    mockUseQueryResult<ChangeRequest[]>(isLoading, isError, data, error)
  );
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  render(
    <RouterWrapper>
      <ChangeRequestsTable />
    </RouterWrapper>
  );
};

describe('change requests table container', () => {
  const NoCRMessage = 'No Change Requests to Display';

  it('renders the loading indicator', () => {
    mockHook(true, false);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Submitter')).not.toBeInTheDocument();
  });

  it('renders the table headers', async () => {
    mockHook(false, false, []);
    renderComponent();

    expect(screen.getByText(/ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Submitter/i)).toBeInTheDocument();
    expect(screen.getByText(/WBS #/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Type/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Accepted/i)[0]).toBeInTheDocument();
  });

  it('handles the api throwing an error', async () => {
    mockHook(false, true);
    renderComponent();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });

  it('handles the api returning an empty array', async () => {
    mockHook(false, false, []);
    renderComponent();

    expect(screen.getByText(NoCRMessage)).toBeInTheDocument();
  });

  it('handles the api returning a normal array of change requests', async () => {
    mockHook(false, false, exampleAllChangeRequests);
    renderComponent();
    await waitFor(() => screen.getByText(exampleAllChangeRequests[0].crId));

    expect(
      screen.getAllByText(fullNamePipe(exampleAllChangeRequests[1].submitter))[0]
    ).toBeInTheDocument();
    expect(screen.getByText(exampleAllChangeRequests[1].crId)).toBeInTheDocument();
    expect(screen.getAllByText(wbsPipe(exampleAllChangeRequests[2].wbsNum))[0]).toBeInTheDocument();

    expect(screen.queryByText(NoCRMessage)).not.toBeInTheDocument();
  });
});
