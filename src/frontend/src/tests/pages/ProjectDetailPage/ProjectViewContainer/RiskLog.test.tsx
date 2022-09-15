/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '../../../../hooks/Theme.hooks';
import themes from '../../../../utils/Themes';
import { Theme } from '../../../../utils/Types';
import RiskLog from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RiskLog';
import { exampleRisk1, exampleRisk2, exampleRisk3 } from '../../../TestSupport/TestData/Risks.stub';
import { Auth } from '../../../../utils/Types';
import { useAuth } from '../../../../hooks/Auth.hooks';
import { mockAuth } from '../../../TestSupport/TestData/TestUtils.stub';
import { exampleAdminUser } from '../../../TestSupport/TestData/Users.stub';
import { exampleProject1 } from '../../../TestSupport/TestData/Projects.stub';

jest.mock('../../../../hooks/Theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

jest.mock('../../../../hooks/Auth.hooks');

const mockedUseAuth = useAuth as jest.Mock<Auth>;

const mockAuthHook = (user = exampleAdminUser) => {
  mockedUseAuth.mockReturnValue(mockAuth(false, user));
};

describe('Rendering Project Risk Log Component', () => {
  beforeEach(() => mockHook());

  const testRisks = [exampleRisk1, exampleRisk2, exampleRisk3];

  it('Renders the RiskLog title', () => {
    mockAuthHook();
    render(
      <RiskLog risks={testRisks} projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />
    );
    expect(screen.getByText('Risk Log')).toBeInTheDocument();
  });

  it('Renders all of the risks', () => {
    mockAuthHook();
    render(
      <RiskLog risks={testRisks} projectId={exampleProject1.id} wbsNum={exampleProject1.wbsNum} />
    );
    expect(screen.getByText('Risk #1')).toBeInTheDocument();
    expect(screen.getByText('Risk #2')).toBeInTheDocument();
    expect(screen.getByText('Risk #3')).toBeInTheDocument();
  });
});
