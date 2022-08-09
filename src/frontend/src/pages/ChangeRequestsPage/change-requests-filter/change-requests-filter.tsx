/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { ChangeRequestType, ChangeRequestReason } from 'shared';
import PageBlock from '../../../layouts/page-block/page-block';
import styles from './change-requests-filter.module.scss';

interface FilterFieldStateProps {
  update: (
    type: string,
    impact: number[],
    reason: string,
    state: number[],
    implemented: string
  ) => void;
}

const ChangeRequestsFilter: React.FC<FilterFieldStateProps> = ({
  update
}: FilterFieldStateProps) => {
  const [type, setType] = useState('');
  const [impact, setImpact] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  const [state, setState] = useState<number[]>([]);
  const [implemented, setImplemented] = useState('');

  // Build a list of dropdown options from the provided strings
  const genDropdownItems = (
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const dropdownItemTemplate = (key: string, value: string) => (
      <Dropdown.Item key={key} onClick={() => setter(value)}>
        {key}
      </Dropdown.Item>
    );
    const dropdownItems = values.map((val) => dropdownItemTemplate(val, val));
    dropdownItems.push(dropdownItemTemplate('None', ''));
    return <>{dropdownItems}</>;
  };

  const genCheckboxes = (
    values: string[],
    value: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    const toggleValue = (currVal: string): void => {
      const index = values.indexOf(currVal);
      const present = value.indexOf(index) !== -1;

      let newVals = [...value];
      if (present) {
        newVals = newVals.filter((item) => item !== index);
      } else {
        newVals.push(index);
      }

      setter(newVals);
    };
    return (
      <>
        {values.map((val, index) => (
          <Form.Check
            key={val}
            id={val}
            type="checkbox"
            onChange={() => toggleValue(val)}
            label={val}
            checked={value.includes(index)}
          />
        ))}
      </>
    );
  };

  return (
    <PageBlock title="Filters">
      <Form>
        <Form.Group>
          <Form.Label>Type</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="type-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {type}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItems(Object.values(ChangeRequestType), setType)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Form.Group>
          <Form.Label>Impact</Form.Label>
          {genCheckboxes(['Scope', 'Budget', 'Timeline'], impact, setImpact)}
        </Form.Group>
        <Form.Group>
          <Form.Label>Reason</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="reason-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {reason}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItems(Object.values(ChangeRequestReason), setReason)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Form.Group>
          <Form.Label>State</Form.Label>
          {genCheckboxes(['Not Reviewed', 'Accepted', 'Denied'], state, setState)}
        </Form.Group>
        <Form.Group>
          <Form.Label>Implemented</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="implemented-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {implemented}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItems(['Yes', 'No'], setImplemented)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Button
          className={'float-left'}
          variant={'outline-secondary'}
          onClick={() => {
            setType('');
            setImpact([]);
            setReason('');
            setState([]);
            setImplemented('');
            update('', [], '', [], '');
          }}
        >
          Clear
        </Button>
        <Button
          className={'float-right'}
          variant={'outline-primary'}
          onClick={() => update(type, impact, reason, state, implemented)}
        >
          Apply
        </Button>
      </Form>
    </PageBlock>
  );
};

export default ChangeRequestsFilter;
