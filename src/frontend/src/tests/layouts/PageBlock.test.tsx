/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../TestSupport/TestUtils';
import { useTheme } from '../../hooks/Theme.hooks';
import { Theme } from '../../utils/Types';
import themes from '../../utils/Themes';
import PageBlock from '../../layouts/PageBlock';

jest.mock('../../hooks/Theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

const renderComponent = (headerRight = false) => {
  return render(
    <PageBlock title={'test'} headerRight={headerRight ? <p>hi</p> : undefined}>
      hello
    </PageBlock>
  );
};

describe('card component', () => {
  beforeEach(() => mockHook());

  it('renders without error', () => {
    renderComponent();
  });

  it('renders title', () => {
    renderComponent();

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders header right', () => {
    renderComponent(true);

    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderComponent();

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
