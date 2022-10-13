/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import CheckList, { CheckListItem } from '../../components/CheckList';
import { routerWrapperBuilder } from '../test-support/test-utils';
import themes from '../../utils/Themes';
import * as themeHooks from '../../hooks/theme.hooks';
import * as authHooks from '../../hooks/auth.hooks';
import * as descBulletHooks from '../../hooks/description-bullets.hooks';
import { mockAuth } from '../test-support/test-data/test-utils.stub';
import { exampleAdminUser } from '../test-support/test-data/users.stub';
import { mockCheckDescBulletReturnValue } from '../test-support/mock-hooks';

const testItems: CheckListItem[] = [
  { id: 1, detail: 'testItem1', resolved: false },
  { id: 2, detail: 'testItem2', resolved: true }
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
  beforeEach(() => {
    jest.spyOn(themeHooks, 'useTheme').mockReturnValue(themes[0]);
    jest.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    jest.spyOn(descBulletHooks, 'useCheckDescriptionBullet').mockReturnValue(mockCheckDescBulletReturnValue);
  });

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
