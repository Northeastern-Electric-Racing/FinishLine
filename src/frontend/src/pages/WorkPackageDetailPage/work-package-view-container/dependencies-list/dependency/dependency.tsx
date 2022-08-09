/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, ButtonGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { WbsNumber } from 'shared';
import { wbsPipe } from '../../../../../pipes';
import { routes } from '../../../../../routes';

interface DependencyProps {
  wbsNumber: WbsNumber;
  handleDelete: any;
}

const Dependency: React.FC<DependencyProps> = ({ wbsNumber, handleDelete }) => {
  const history = useHistory();

  function handleLinkClick() {
    history.push(`${routes.PROJECTS}/${wbsPipe(wbsNumber)}`);
  }

  return (
    <ButtonGroup>
      <Button variant="outline-danger" onClick={handleLinkClick}>
        {wbsPipe(wbsNumber)}
      </Button>
      <Button variant="danger" onClick={() => handleDelete(wbsNumber)}>
        X
      </Button>
    </ButtonGroup>
  );
};

export default Dependency;
