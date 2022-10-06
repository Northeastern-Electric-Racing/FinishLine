/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import CheckList, { CheckListItem } from '../../components/CheckList';
import { routerWrapperBuilder } from '../test-support/test-utils';
import { useTheme } from '../../hooks/Theme.hooks';
import { Theme } from '../../utils/Types';
import themes from '../../utils/Themes';

jest.mock('../../hooks/Theme.hooks');
const mockTheme = useTheme as jest.Mock<Theme>;

const mockHook = () => {
  mockTheme.mockReturnValue(themes[0]);
};

const testItems: CheckListItem[] = [
  { details: 'testItem1', resolved: false },
  { details: 'testItem2', resolved: true }
];

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (items: CheckListItem[] = [], title: string = '') => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <CheckList items={items} title={title} />
    </RouterWrapper>
  );
};
describe('Rendering CheckList Component', () => {
  beforeEach(() => mockHook());
  it('Renders the CheckList correctly when empty', () => {
    renderComponent([], 'testTitle');
    expect(screen.getByText('testTitle')).toBeInTheDocument();
    expect(screen.queryByText('testItem1')).not.toBeInTheDocument();
    expect(screen.queryByText('testItem2')).not.toBeInTheDocument();
  });
  it('Renders the CheckList correctly when not empty', () => {
    renderComponent(testItems, 'testTitle');
    expect(screen.getByText('testTitle')).toBeInTheDocument();
    expect(screen.getByText('testItem1')).toBeInTheDocument();
    expect(screen.getByText('testItem2')).toBeInTheDocument();
  });
});
