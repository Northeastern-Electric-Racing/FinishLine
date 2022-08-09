/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, InputGroup, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { validateWBS, WbsNumber } from 'shared';
import HorizontalList from '../../../../components/horizontal-list/horizontal-list';
import Dependency from './dependency/dependency';

interface DependenciesListProps {
  dependencies: WbsNumber[];
  setter: any;
}

const DependenciesList: React.FC<DependenciesListProps> = ({ dependencies, setter }) => {
  const [dependenciesState, setDependenciesState] = useState(dependencies);
  const [unvalidatedDependency, setUnvalidatedDependency] = useState('');

  // useEffect(() => {
  //   setDependenciesState(dependencies);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editMode]);

  // set form state for dependencies
  useEffect(() => {
    setter(dependenciesState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependenciesState]);

  const handleDelete = (dependencyToDelete: WbsNumber) => {
    const index = dependenciesState.indexOf(dependencyToDelete);
    if (index !== -1) {
      const half1 = dependenciesState.slice(0, index);
      const half2 = dependenciesState.slice(index + 1);
      setDependenciesState(half1.concat(half2));
    }
  };

  const handleAdd = () => {
    try {
      setDependenciesState([...dependenciesState, validateWBS(unvalidatedDependency)]);
    } catch (error: any) {
      alert(error.message);
    }
    setUnvalidatedDependency('');
  };

  const AddButton = (
    <InputGroup>
      <Form.Control
        type="text"
        placeholder="New WBS #"
        onChange={(e) => setUnvalidatedDependency(e.target.value)}
      ></Form.Control>
      <Button variant="success" onClick={handleAdd}>
        +
      </Button>
    </InputGroup>
  );

  const items = dependenciesState.map((e) => (
    <Dependency wbsNumber={e} handleDelete={handleDelete} />
  ));

  return <HorizontalList title={'Dependencies'} items={[...items, AddButton]} />;
};

export default DependenciesList;
