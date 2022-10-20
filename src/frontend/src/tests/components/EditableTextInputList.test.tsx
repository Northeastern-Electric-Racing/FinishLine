/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { act, fireEvent, render, screen } from '../test-support/test-utils';
import EditableTextInputList from '../../components/EditableTextInputList';

type MockItem = {
  detail: string;
  isResolved?: boolean;
};

const mockItems: MockItem[] = [{ detail: 'tee hee' }, { detail: 'yahello' }, { detail: 'yeet' }, { detail: 'yoink' }];

const mockResolvableItems: MockItem[] = [
  { detail: 'tee hee', isResolved: false },
  { detail: 'yahello', isResolved: false },
  { detail: 'yeet', isResolved: true },
  { detail: 'yoink', isResolved: true }
];

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
  describe('multiple items', () => {
    it('render x buttons', () => {
      renderComponent(mockItems);

      expect(screen.getAllByRole('button', { name: 'X' })).toHaveLength(4);
    });

    it('render + add new bullet button', () => {
      renderComponent(mockItems);

      expect(screen.getByRole('button', { name: '+ Add New Bullet' })).toBeInTheDocument();
    });

    it('render content', async () => {
      renderComponent(mockItems);

      const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
      res.forEach((item, index) => {
        expect(item.value).toEqual(mockItems[index].detail);
      });
      expect(screen.getAllByRole('textbox')).toHaveLength(4);
    });

    it('correctly disables content', () => {
      renderComponent(mockResolvableItems);

      expect(screen.getByTestId('inputField0')).not.toBeDisabled();
      expect(screen.getByTestId('inputField2')).toBeDisabled();
      expect(screen.getByTestId('removeButton1')).not.toBeDisabled();
      expect(screen.getByTestId('removeButton3')).toBeDisabled();
    });
  });

  describe('no items', () => {
    it('render x button', () => {
      renderComponent([]);

      expect(screen.queryByText('X')).not.toBeInTheDocument();
    });

    it('render + add new bullet button', () => {
      renderComponent([]);

      expect(screen.getByRole('button', { name: '+ Add New Bullet' })).toBeInTheDocument();
    });

    it('no text boxes rendered', async () => {
      renderComponent([]);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should add a new entry after pressing enter with text in the last box', async () => {
      renderComponent([{ detail: 'test' }]);

      await act(async () => {
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 13 });
      });
      expect(mockAdd).toBeCalledTimes(1);
    });

    it('should not add a new entry after pressing enter with no text in the last box', async () => {
      renderComponent([{ detail: '' }]);

      await act(async () => {
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 13 });
      });
      expect(mockAdd).toBeCalledTimes(0);
    });

    it('should not add a new entry after pressing enter in the non last box', async () => {
      renderComponent([{ detail: 'bat' }, { detail: '' }]);

      await act(async () => {
        fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Enter', code: 13 });
      });
      expect(mockAdd).toBeCalledTimes(0);
    });

    it('should create a new entry after removing the last empty entry and the new last one is full', async () => {
      renderComponent([{ detail: 'bat' }, { detail: '' }]);
      await act(async () => {
        fireEvent.click(screen.getAllByText('X')[1]);
      });
      expect(mockAdd).toBeCalledTimes(0);
      expect(mockRemove).toBeCalledTimes(1);
      await act(async () => {
        fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Enter', code: 13 });
      });
      expect(mockAdd).toBeCalledTimes(1);
      expect(mockRemove).toBeCalledTimes(1);
    });

    it('should not create a new entry after removing the last empty entry and the new last one is empty', async () => {
      renderComponent([{ detail: '' }, { detail: '' }]);
      await act(async () => {
        fireEvent.click(screen.getAllByText('X')[1]);
      });
      expect(mockAdd).toBeCalledTimes(0);
      expect(mockRemove).toBeCalledTimes(1);
      await act(async () => {
        fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Enter', code: 13 });
      });
      expect(mockAdd).toBeCalledTimes(0);
      expect(mockRemove).toBeCalledTimes(1);
    });
  });
});
