/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../test-support/test-utils';
import EditableTextInputList from '../../components/EditableTextInputList';

type MockItem = {
  detail: string;
  isResolved?: boolean;
};

const mockItems: MockItem[] = [{ detail: 'tee hee' }, { detail: 'yahello' }, { detail: 'yeet' }, { detail: 'yoink' }];

const mockAdd = jest.fn();
const mockRemove = jest.fn();

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (items: any) => {
  return render(
    <EditableTextInputList
      items={items.map((item: MockItem) => item.detail)}
      add={mockAdd}
      remove={mockRemove}
      update={() => null}
      disabledItems={items.map((item: MockItem) => item.isResolved)}
    />
  );
};

describe('editable text input list test suite', () => {
  it('renders all the info', async () => {
    renderComponent(mockItems);

    const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
    res.forEach((item, index) => {
      expect(item.value).toEqual(mockItems[index].detail);
    });

    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getByRole('button', { name: '+ Add New Bullet' })).toBeInTheDocument();
  });

  it('renders no text boxes and the add button if there are no items', () => {
    renderComponent([]);

    expect(screen.getByRole('button', { name: '+ Add New Bullet' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
