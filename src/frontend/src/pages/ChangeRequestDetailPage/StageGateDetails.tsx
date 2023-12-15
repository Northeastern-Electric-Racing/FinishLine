/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { StageGateChangeRequest } from 'shared';
import { booleanPipe } from '../../utils/pipes';
import InfoBlock from '../../components/InfoBlock';
import { Typography } from '@mui/material';

interface StageGateDetailsProps {
  cr: StageGateChangeRequest;
}

const StageGateDetails: React.FC<StageGateDetailsProps> = ({ cr }) => {
  return (
    <InfoBlock title={'Confirm WP Completed'}>
      <Typography>{booleanPipe(cr.confirmDone)}</Typography>
    </InfoBlock>
  );
};

export default StageGateDetails;
