/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, ButtonGroup } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { WbsNumber } from 'shared';
import { NERButton } from '../../../components/NERButton';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';

interface BlockedByProps {
  wbsNumber: WbsNumber;
  handleDelete: (wbsNumber: WbsNumber) => void;
}

const BlockedBy: React.FC<BlockedByProps> = ({ wbsNumber, handleDelete }) => {
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

export default BlockedBy;
