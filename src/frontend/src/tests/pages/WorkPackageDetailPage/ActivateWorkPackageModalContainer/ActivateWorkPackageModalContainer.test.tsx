/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult } from 'react-query';
import { render, screen } from '../../../test-support/test-utils';
import { wbsPipe } from '../../../../utils/pipes';
import { exampleWbs1 } from '../../../test-support/test-data/wbs-numbers.stub';
import ActivateWorkPackageModalContainer from '../../../../pages/WorkPackageDetailPage/ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import { mockAuth, mockUseMutationResult } from '../../../test-support/test-data/test-utils.stub';
import { useCreateActivationChangeRequest } from '../../../../hooks/change-requests.hooks';
import { exampleAdminUser, exampleAllUsers } from '../../../test-support/test-data/users.stub';
import * as authHooks from '../../../../hooks/auth.hooks';
import * as userHooks from '../../../../hooks/users.hooks';
import {
  mockLogUserInDevReturnValue,
  mockLogUserInReturnValue,
  mockUseAllUsersReturnValue
} from '../../../test-support/mock-hooks';

jest.mock('../../../../hooks/change-requests.hooks');

jest.mock('../../../../hooks/toasts.hooks');

// random shit to make test happy by mocking out this hook
const mockedUseCreateActivationCR = useCreateActivationChangeRequest as jest.Mock<UseMutationResult>;

const mockUseCreateActivationCRHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseCreateActivationCR.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

const renderComponent = () => {
  return render(<ActivateWorkPackageModalContainer modalShow={true} handleClose={() => null} wbsNum={exampleWbs1} />);
};

describe('activate work package modal container test suite', () => {
  beforeEach(() => {
    jest.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    jest.spyOn(userHooks, 'useLogUserIn').mockReturnValue(mockLogUserInReturnValue);
    jest.spyOn(userHooks, 'useLogUserInDev').mockReturnValue(mockLogUserInDevReturnValue);
    jest.spyOn(userHooks, 'useAllUsers').mockReturnValue(mockUseAllUsersReturnValue(exampleAllUsers));
  });

  it('renders component without crashing', () => {
    mockUseCreateActivationCRHook(false, false);
    renderComponent();

    expect(screen.getByText(`Activate #${wbsPipe(exampleWbs1)}`)).toBeInTheDocument();
  });
});
