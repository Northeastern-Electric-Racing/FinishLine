/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult, UseQueryResult } from 'react-query';
import { render, screen } from '../../../test-support/test-utils';
import { wbsPipe } from '../../../../utils/pipes';
import { exampleWbs1 } from '../../../test-support/test-data/wbs-numbers.stub';
import StageGateWorkPackageModalContainer from '../../../../pages/WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import { mockUseMutationResult, mockUseQueryResult } from '../../../test-support/test-data/test-utils.stub';
import { useCreateStageGateChangeRequest } from '../../../../hooks/change-requests.hooks';
import { useSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { WorkPackage } from 'shared';
import { exampleWorkPackage5 } from '../../../test-support/test-data/work-packages.stub';

vi.mock('../../../../hooks/change-requests.hooks');
vi.mock('../../../../hooks/work-packages.hooks');
vi.mock('../../../../hooks/toasts.hooks');

const mockedUseCreateStageGateCR = useCreateStageGateChangeRequest as jest.Mock<UseMutationResult>;
const mockUseCreateStageGateCRHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseCreateStageGateCR.mockReturnValue(mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error));
};

const mockedUseSingleWorkPackage = useSingleWorkPackage as jest.Mock<UseQueryResult<WorkPackage>>;
const mockUseSingleWorkPackageHook = (isLoading: boolean, isError: boolean, data?: WorkPackage, error?: Error) => {
  mockedUseSingleWorkPackage.mockReturnValue(mockUseQueryResult<WorkPackage>(isLoading, isError, data, error));
};

const renderComponent = () => {
  return render(<StageGateWorkPackageModalContainer modalShow={true} handleClose={() => null} wbsNum={exampleWbs1} />);
};

describe('stage gate work package modal container test suite', () => {
  it('renders component without crashing', () => {
    mockUseCreateStageGateCRHook(false, false);
    mockUseSingleWorkPackageHook(false, false, exampleWorkPackage5);
    renderComponent();

    expect(screen.getByText(`Stage Gate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });
});
