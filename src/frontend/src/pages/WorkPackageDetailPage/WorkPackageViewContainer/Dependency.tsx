/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, ButtonGroup } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { WbsNumber } from 'shared';
import { NERButton } from '../../../components/NERButton';
import { wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';

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
      <Button variant="outlined" onClick={handleLinkClick}>
        {wbsPipe(wbsNumber)}
      </Button>
      <NERButton variant="contained" onClick={() => handleDelete(wbsNumber)}>
        X
      </NERButton>
    </ButtonGroup>
  );
};

export default Dependency;
