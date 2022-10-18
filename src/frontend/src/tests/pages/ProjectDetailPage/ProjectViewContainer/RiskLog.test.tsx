/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '../../../../hooks/theme.hooks';
import themes from '../../../../utils/Themes';
import { Theme } from '../../../../utils/Types';
import RiskLog from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RiskLog';
import {
  exampleRisk1,
  exampleRisk2,
  exampleRisk3,
  exampleRisk4
} from '../../../test-support/test-data/risks.stub';
import { Auth } from '../../../../utils/Types';
import { useAuth } from '../../../../hooks/auth.hooks';
import {
  mockAuth,
  mockPromiseAxiosResponse
} from '../../../test-support/test-data/test-utils.stub';
import {
  exampleAdminUser,
  exampleGuestUser,
  exampleMemberUser
} from '../../../test-support/test-data/users.stub';
import { exampleProject1 } from '../../../test-support/test-data/projects.stub';
import { getRisksForProject } from '../../../../apis/Risks.api';
import { AxiosResponse } from 'axios';
import { Risk } from 'shared';
import { useGetRisksForProject } from '../../../../hooks/risks.hooks';
import { renderHook } from '@testing-library/react-hooks';
import wrapper from '../../../../app/AppContextQuery';

jest.mock('../../../../hooks/theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

jest.mock('../../../../hooks/auth.hooks');
const mockedUseAuth = useAuth as jest.Mock<Auth>;

jest.mock('../../../../apis/Risks.api');

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

const testRisks = [exampleRisk1, exampleRisk2, exampleRisk3, exampleRisk4];

describe.skip('Rendering Project Risk Log Component', () => {
  beforeEach(() => mockHook());
  it('Renders the RiskLog title', async () => {
    mockAuthHook();
    const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
    mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));
    const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
      wrapper
    });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(testRisks);
    render(<RiskLog projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />);
    expect(screen.getByText('Risk Log')).toBeInTheDocument();
  });

  it('Allows deletion of own risks', async () => {
    mockAuthHook(exampleMemberUser);
    const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
    mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));
    const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
      wrapper
    });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(testRisks);
    render(<RiskLog projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />);
    expect(screen.getByTestId);
    expect(screen.getByTestId('deleteButton-risk2')).toBeDisabled();
    expect(screen.getByTestId('deleteButton-risk4')).toBeEnabled();
  });

  it('Renders all of the risks and buttons when authorized', async () => {
    mockAuthHook();
    const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
    mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));
    const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
      wrapper
    });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(testRisks);
    render(<RiskLog projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />);
    expect(screen.getByText('Risk #1')).toBeInTheDocument();
    expect(screen.getByText('Risk #2')).toBeInTheDocument();
    expect(screen.getByText('Risk #3')).toBeInTheDocument();
    expect(screen.getByTestId('deleteButton')).toBeInTheDocument();
    expect(screen.getByTestId('convertButton')).toBeInTheDocument();
    expect(screen.getByTestId('testCheckbox1')).toBeInTheDocument();
  });

  it('Renders all of the risks and buttons when unauthorized', async () => {
    mockAuthHook(exampleGuestUser);
    const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
    mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));
    const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
      wrapper
    });
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(testRisks);
    render(<RiskLog projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />);
    expect(screen.getByText('Risk #1')).toBeInTheDocument();
    expect(screen.getByText('Risk #2')).toBeInTheDocument();
    expect(screen.getByText('Risk #3')).toBeInTheDocument();
    expect(screen.queryByTestId('deleteButton-risk2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('createButton')).not.toBeInTheDocument();
    expect(screen.getByTestId('convertButton')).toBeInTheDocument();
    expect(screen.queryByTestId('testCheckbox1')).not.toBeInTheDocument();
  });
});
