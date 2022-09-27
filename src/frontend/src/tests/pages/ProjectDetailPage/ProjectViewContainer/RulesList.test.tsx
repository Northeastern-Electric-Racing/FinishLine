/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '../../../../hooks/Theme.hooks';
import themes from '../../../../utils/Themes';
import { Theme } from '../../../../utils/Types';
import { exampleProject1 } from '../../../test-support/test-data/projects.stub';
import RulesList from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RulesList';

jest.mock('../../../../hooks/Theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

describe('Rendering Work Package Rules Component', () => {
  beforeEach(() => mockHook());

  it('renders the component title', () => {
    render(<RulesList rules={exampleProject1.rules} />);

    expect(screen.getByText(`Rules`)).toBeInTheDocument();
  });

  it('renders all the listed rules', () => {
    render(<RulesList rules={exampleProject1.rules} />);

    expect(screen.getByText('EV3.5.2')).toBeInTheDocument();
  });
});
