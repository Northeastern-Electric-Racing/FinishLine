/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult } from 'react-query';
import { render, screen } from '../../../TestSupport/TestUtils';
import { wbsPipe } from '../../../../utils/Pipes';
import { exampleWbs1 } from '../../../TestSupport/TestData/WbsNumbers.stub';
import StageGateWorkPackageModalContainer from '../../../../pages/WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import { mockUseMutationResult } from '../../../TestSupport/TestData/TestUtils.stub';
import { useCreateStageGateChangeRequest } from '../../../../hooks/ChangeRequests.hooks';

jest.mock('../../../../hooks/ChangeRequests.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseCreateStageGateCR = useCreateStageGateChangeRequest as jest.Mock<UseMutationResult>;

const mockUseCreateStageGateCRHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseCreateStageGateCR.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

const renderComponent = () => {
  return render(
    <StageGateWorkPackageModalContainer
      modalShow={true}
      handleClose={() => null}
      wbsNum={exampleWbs1}
    />
  );
};

describe('stage gate work package modal container test suite', () => {
  it('renders component without crashing', () => {
    mockUseCreateStageGateCRHook(false, false);
    renderComponent();

    expect(screen.getByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });

  it('renders loading indicator when loading', () => {
    mockUseCreateStageGateCRHook(true, false);
    renderComponent();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error page when error', () => {
    mockUseCreateStageGateCRHook(false, true, new Error('some error'));
    renderComponent();

    expect(screen.getByText('Oops, sorry!')).toBeInTheDocument();
  });
});
