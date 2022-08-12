/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { useState, useRef } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

interface EditableTextInputListProps {
  items: any[];
  readOnly?: boolean;
  ordered?: boolean;
  add: (val: any) => any;
  remove: (idx: number) => any;
  update: (idx: number, val: any) => any;
}

const EditableTextInputList: React.FC<EditableTextInputListProps> = ({
  items,
  readOnly,
  ordered,
  add,
  remove,
  update
}) => {
  // last input of the list is being kept track of so that we know if we should add a new input when enter is pressed
  // (only add one when the box is not empty)
  const [lastInput, setLastInput] = useState(
    items.length > 0 ? items[items.length - 1].toString() : ''
  );

  // this hook is used to prevent auto focusing on something when the page is loaded
  const [hasTyped, setHasTyped] = useState(false);

  const focusRef = useRef<HTMLInputElement>(null);

  /**
   * Handles key presses in the form control.
   * @param e the event of the key press
   * @param index the index of the input being pressed within the items list
   */
  const handleKeyDown = (e: any, index: number) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        setHasTyped(true);

        // if the last input is not empty, make a new input
        if (lastInput) {
          addButtonOnClick();
        }

        // set the focus to the last input
        focusRef.current?.focus();
        break;
    }
  };

  /**
   * On click function for the add button.
   */
  const addButtonOnClick = () => {
    add('');
    setLastInput('');
  };

  /**
   * On click function for the remove button
   * @param index the index of the input being removed
   */
  const removeButtonOnClick = (index: number) => {
    remove(index);
    if (isLastElement(index)) {
      setLastInput(items.length >= 2 ? items[index - 1] : '');
    }
  };

  /**
   * Checks if the given index is the last element of items.
   * @param index the given index
   * @returns true if the index is the last element of items
   */
  const isLastElement = (index: number) => {
    return index === items.length - 1;
  };

  let listPrepared = items.map((item, index: number) =>
    !readOnly ? (
      <li key={index} className={'mb-2'}>
        <InputGroup>
          <Form.Control
            required
            autoFocus={hasTyped && isLastElement(index)}
            type="text"
            ref={isLastElement(index) ? focusRef : null}
            value={item.toString()}
            placeholder={'Input new bullet here...'}
            onKeyDown={(e: any) => handleKeyDown(e, index)}
            onChange={(e: any) => {
              setHasTyped(true);
              update(index, e.target.value);
              if (isLastElement(index)) {
                setLastInput(e.target.value);
              }
            }}
          />
          <Button type="button" variant="danger" onClick={() => removeButtonOnClick(index)}>
            X
          </Button>
        </InputGroup>
      </li>
    ) : (
      <li key={index}>{item}</li>
    )
  );

  const addButton = (
    <Button type="button" variant="success" onClick={addButtonOnClick}>
      + Add New Bullet
    </Button>
  );

  const style = readOnly ? {} : { listStyleType: 'none', padding: 0 };

  if (!readOnly) {
    listPrepared = [...listPrepared, addButton];
  }
  let builtList = <ul style={style}>{listPrepared}</ul>;
  if (ordered) {
    builtList = <ol style={style}>{listPrepared}</ol>;
  }

  return <Form.Group>{builtList}</Form.Group>;
};

export default EditableTextInputList;
