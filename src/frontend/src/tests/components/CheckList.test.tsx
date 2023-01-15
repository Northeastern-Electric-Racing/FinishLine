/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import CheckList, { CheckListItem } from '../../components/CheckList';
import { routerWrapperBuilder } from '../test-support/test-utils';
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
const renderComponent = (items: CheckListItem[] = [], title: string = '', isDisabled: boolean) => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <CheckList items={items} title={title} isDisabled={isDisabled} />
    </RouterWrapper>
  );
};

describe('Rendering CheckList Component', () => {
  beforeEach(() => {
    jest.spyOn(authHooks, 'useAuth').mockReturnValue(mockAuth(false, exampleAdminUser));
    jest.spyOn(descBulletHooks, 'useCheckDescriptionBullet').mockReturnValue(mockCheckDescBulletReturnValue);
  });

  it('Renders the CheckList correctly when empty', () => {
    renderComponent([], 'testTitle', false);
    expect(screen.getByText('testTitle')).toBeInTheDocument();
    expect(screen.queryByText('testItem1')).not.toBeInTheDocument();
    expect(screen.queryByText('testItem2')).not.toBeInTheDocument();
  });

  it('Renders the CheckList correctly when not empty', () => {
    renderComponent(testItems, 'testTitle', false);
    expect(screen.getByText('testTitle')).toBeInTheDocument();
    expect(screen.getByText('testItem1')).toBeInTheDocument();
  });

  it('Renders the CheckList items as enabled when isDisabled is false', () => {
    renderComponent(testItems, 'testTitle', false);
    const checkboxes = screen.getAllByRole('checkbox');
    for (const c of checkboxes) {
      expect(c).toBeEnabled();
    }
  });

  it('Renders the CheckList items as disabled when isDisabled is true', () => {
    renderComponent(testItems, 'testTitle', true);
    const checkboxes = screen.getAllByRole('checkbox');
    for (const c of checkboxes) {
      expect(c).toBeDisabled();
    }
  });
});
