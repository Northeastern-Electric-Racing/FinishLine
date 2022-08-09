/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { UseQueryResult } from 'react-query';
import { ChangeRequest, ChangeRequestType, ChangeRequestReason } from 'shared';
import {
  exampleAllChangeRequests,
  exampleActivationChangeRequest,
  exampleStageGateChangeRequest,
  exampleStandardChangeRequest
} from '../../test-support/test-data/change-requests.stub';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { useAllChangeRequests } from '../../services/change-requests.hooks';
import { routerWrapperBuilder } from '../../test-support/test-utils';
import ChangeRequestsTable, { filterCRs } from './change-requests-table';
import { useTheme } from '../../services/theme.hooks';
import { Theme } from '../../types';
import themes from '../../themes';

jest.mock('../../services/change-requests.hooks');

const mockedUseAllChangeRequests = useAllChangeRequests as jest.Mock<
  UseQueryResult<ChangeRequest[]>
>;

jest.mock('../../services/theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = (isLoading: boolean, isError: boolean, data?: ChangeRequest[], error?: Error) => {
  mockedUseAllChangeRequests.mockReturnValue(
    mockUseQueryResult<ChangeRequest[]>(isLoading, isError, data, error)
  );

  mockTheme.mockReturnValue(themes[0]);
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

  it('checking if change request filtering with no filters works as expected', async () => {
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [], '')).toStrictEqual(
      exampleAllChangeRequests
    );
  });

  it('checking if change request filtering with type works as expected', async () => {
    const answer1: ChangeRequest[] = [exampleStandardChangeRequest];
    const answer2: ChangeRequest[] = [exampleActivationChangeRequest];
    expect(
      filterCRs(exampleAllChangeRequests, ChangeRequestType.Issue, [], '', [], '')
    ).toStrictEqual(answer1);
    expect(
      filterCRs(exampleAllChangeRequests, ChangeRequestType.Activation, [], '', [], '')
    ).toStrictEqual(answer2);
    expect(
      filterCRs(exampleAllChangeRequests, ChangeRequestType.Other, [], '', [], '')
    ).toStrictEqual([]);
  });

  it('checking if change request filtering with impact works as expected', async () => {
    const filtered: ChangeRequest[] = [exampleStandardChangeRequest];
    expect(filterCRs(exampleAllChangeRequests, '', [0], '', [], '')).toStrictEqual(filtered);
    expect(filterCRs(exampleAllChangeRequests, '', [0, 1], '', [], '')).toStrictEqual(filtered);
  });

  it('checking if change request filtering with whyType works as expected', async () => {
    const filtered: ChangeRequest[] = [exampleStandardChangeRequest];
    expect(
      filterCRs(exampleAllChangeRequests, '', [], ChangeRequestReason.School, [], '')
    ).toStrictEqual(filtered);
    expect(
      filterCRs(exampleAllChangeRequests, '', [], ChangeRequestReason.Rules, [], '')
    ).toStrictEqual(filtered);
  });
  it('checking if change request filtering with state works as expected', async () => {
    const notReivewed: ChangeRequest[] = [
      exampleActivationChangeRequest,
      exampleStageGateChangeRequest
    ];
    const accepted: ChangeRequest[] = [exampleStandardChangeRequest];
    const denied: ChangeRequest[] = [];
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [0], '')).toStrictEqual(notReivewed);
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [1], '')).toStrictEqual(accepted);
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [2], '')).toStrictEqual(denied);
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [0, 1], '')).toStrictEqual(
      exampleAllChangeRequests
    );
  });

  it('checking if change request filtering with implemented works as expected', async () => {
    const no: ChangeRequest[] = [exampleActivationChangeRequest, exampleStageGateChangeRequest];
    const yes: ChangeRequest[] = [exampleStandardChangeRequest];
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [], 'Yes')).toStrictEqual(yes);
    expect(filterCRs(exampleAllChangeRequests, '', [], '', [], 'No')).toStrictEqual(no);
  });

  it('checking if change request filtering with multiple filters works as expected', async () => {
    expect(
      filterCRs(
        exampleAllChangeRequests,
        ChangeRequestType.Issue,
        [0],
        ChangeRequestReason.School,
        [1],
        'Yes'
      )
    ).toStrictEqual([exampleStandardChangeRequest]);
  });
});
