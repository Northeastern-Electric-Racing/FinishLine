/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { useTheme } from '../../hooks/theme.hooks';
import { Theme } from '../../utils/Types';
import themes from '../../utils/Themes';
import HorizontalList from '../../components/HorizontalList';

jest.mock('../../hooks/theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

describe('Horizontal List Component', () => {
  beforeEach(() => mockHook());

  it('renders the title', () => {
    render(<HorizontalList title={'test'} items={[<>one</>, <>two</>]} />);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders all the listed items', () => {
    render(<HorizontalList title={'test'} items={[<>one</>, <>two</>]} />);

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('renders all the listed items with header right', () => {
    render(<HorizontalList title={'test'} headerRight={'hi'} items={['oh', 'two']} />);

    expect(screen.getByText('hi')).toBeInTheDocument();
    expect(screen.getByText('oh')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });
});
