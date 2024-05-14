/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, SetStateAction } from 'react';
import { NERButton } from '../../../components/NERButton';

interface MonthSelectorProps {
  displayMonth: Date;
  setDisplayMonth: Dispatch<SetStateAction<Date>>;
}

const TodayButton: React.FC<MonthSelectorProps> = ({ displayMonth, setDisplayMonth }) => {
  return (
    <NERButton
      variant="contained"
      onClick={() => {
        setDisplayMonth(new Date());
      }}
    >
      Today
    </NERButton>
  );
};

export default TodayButton;
