/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useToggleTheme } from '../../../../hooks/Theme.hooks';
import themes from '../../../../utils/Themes';
import { Theme } from '../../../../utils/Types';
import RiskLog from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RiskLog';

jest.mock('../../../../hooks/Theme.hooks');
const mockTheme = useToggleTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

describe('Rendering Project Risk Log Component', () => {
  beforeEach(() => mockHook());

  const testRisks = [
    { details: 'Risk #1', resolved: false },
    { details: 'Risk #2', resolved: true },
    { details: 'Risk #3', resolved: false }
  ];

  it('Renders the RiskLog title', () => {
    render(<RiskLog risks={testRisks} />);

    expect(screen.getByText('Risk Log')).toBeInTheDocument();
  });

  it('Renders all of the risks', () => {
    render(<RiskLog risks={testRisks} />);

    expect(screen.getByText('Risk #1')).toBeInTheDocument();
    expect(screen.getByText('Risk #2')).toBeInTheDocument();
    expect(screen.getByText('Risk #3')).toBeInTheDocument();
  });
});
