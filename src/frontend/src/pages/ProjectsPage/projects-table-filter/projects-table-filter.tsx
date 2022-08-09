/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { User, WbsElementStatus } from 'shared';
import { fullNamePipe } from '../../../pipes';
import PageBlock from '../../../layouts/page-block/page-block';
import styles from './projects-table-filter.module.scss';

/**
 * Variables to filter table with.
 */
interface FilterProps {
  leads: User[];
  managers: User[];
  onClick: (
    status: string,
    projectLeadID: number,
    projectManagerID: number,
    carNumber: number
  ) => void;
}

/**
 * Interactive table for setting filter parameters.
 * @param onClick Determines what happens when the Apply button is clicked.
 * @param leads The list of names of project leads.
 * @param managers The list of names of project managers.
 */
const ProjectsTableFilter: React.FC<FilterProps> = ({ onClick, leads, managers }: FilterProps) => {
  const [status, setStatus] = useState('');
  const [project_leadName, setProject_leadName] = useState('');
  const [project_leadID, setProject_leadID] = useState(-1);
  const [project_managerName, setProject_managerName] = useState('');
  const [project_managerID, setProject_managerID] = useState(-1);
  const [car_number, setCar_number] = useState(-1);

  /**
   * Programmatically generates dropdown menu items for state variables of type number.
   * @param values The list of menu item values.
   * @param setter The setter function for the variable the component records.
   * @return An array of dropdown menu items.
   */
  const genDropdownItemsNum = (
    values: number[],
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const none = (
      <Dropdown.Item key={'None'} onClick={() => setter(-1)}>
        None
      </Dropdown.Item>
    );
    const result: any[] = [none];
    for (const value of values) {
      result.push(
        <Dropdown.Item key={value} onClick={() => setter(value)}>
          {value}
        </Dropdown.Item>
      );
    }
    return <div>{result}</div>;
  };

  /**
   * Programmatically generates dropdown menu items for state variables of type string.
   * @param values The list of menu item values.
   * @param setter The setter function for the variable the component records.
   * @return An array of dropdown menu items.
   */
  const genDropdownItemsString = (
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const none = (
      <Dropdown.Item key={'None'} onClick={() => setter('')}>
        None
      </Dropdown.Item>
    );
    const result: any[] = [none];
    for (const value of values) {
      result.push(
        <Dropdown.Item key={value} onClick={() => setter(value)}>
          {value}
        </Dropdown.Item>
      );
    }
    return <div>{result}</div>;
  };

  /**
   * This function resets all the filter fields to default and sends the default values to the project table as well.
   */
  const resetFiltersToDefault = () => {
    onClick('', -1, -1, -1);
    setCar_number(-1);
    setProject_leadID(-1);
    setProject_leadName('');
    setStatus('');
    setProject_managerID(-1);
    setProject_managerName('');
  };

  /**
   * Programmatically generates dropdown menu items for state variables representing users.
   * @param users The list of menu item values.
   * @param idSetter The setter function for the id of the user.
   * @param nameSetter The setter function for the name of the user.
   * @return An array of dropdown menu items.
   */
  const genDropdownItemsUser = (
    users: User[],
    idSetter: React.Dispatch<React.SetStateAction<number>>,
    nameSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const none = (
      <Dropdown.Item
        key={'None'}
        onClick={() => {
          idSetter(-1);
          nameSetter('');
        }}
      >
        None
      </Dropdown.Item>
    );
    const result: any[] = [none];
    for (const user of users) {
      const userName: string = fullNamePipe(user);
      const { userId: userID } = user;
      result.push(
        <Dropdown.Item
          key={userName}
          onClick={() => {
            idSetter(userID);
            nameSetter(userName);
          }}
        >
          {userName}
        </Dropdown.Item>
      );
    }
    return <div>{result}</div>;
  };

  return (
    <PageBlock title="Filters">
      <Form>
        <Form.Group>
          <Form.Label>Car Number</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="car-num-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {car_number === -1 ? '' : car_number}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItemsNum([0, 1, 2], setCar_number)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="status-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {status}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItemsString(Object.values(WbsElementStatus), setStatus)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Form.Group>
          <Form.Label>Project Lead</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="lead-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {project_leadName}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItemsUser(leads, setProject_leadID, setProject_leadName)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Form.Group>
          <Form.Label>Project Manager</Form.Label>
          <Dropdown className={styles.dropdown}>
            <Dropdown.Toggle
              data-testid="manager-toggle"
              variant="light"
              id="dropdown-split-basic"
              block={true}
              className={'text-left ' + styles.dropdownButton}
            >
              {project_managerName}
            </Dropdown.Toggle>
            <Dropdown.Menu className="btn-block" align="right">
              {genDropdownItemsUser(managers, setProject_managerID, setProject_managerName)}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
        <Button
          className={'float-left'}
          variant={'outline-secondary'}
          onClick={resetFiltersToDefault}
        >
          Clear
        </Button>
        <Button
          className={'float-right'}
          variant={'outline-primary'}
          onClick={() => onClick(status, project_leadID, project_managerID, car_number)}
        >
          Apply
        </Button>
      </Form>
    </PageBlock>
  );
};

export default ProjectsTableFilter;
