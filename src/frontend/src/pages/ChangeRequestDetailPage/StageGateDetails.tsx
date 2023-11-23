/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { StageGateChangeRequest } from 'shared';
import { booleanPipe } from '../../utils/pipes';
import CRBlock from '../../layouts/CRBlock';

interface StageGateDetailsProps {
  cr: StageGateChangeRequest;
}

const StageGateDetails: React.FC<StageGateDetailsProps> = ({ cr }) => {
  return <CRBlock title={'Confirm WP Completed'} children={booleanPipe(cr.confirmDone)}></CRBlock>;
};

export default StageGateDetails;
