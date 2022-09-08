/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import CheckList from '../../../components/CheckList';
import { Risk, WbsNumber } from 'shared';

interface RiskLogProps {
  risks: Risk[];
  wbsNum: WbsNumber;
}

const RiskLog: React.FC<RiskLogProps> = ({ risks, wbsNum }) => {
  const formatRisks = (risks: Risk[]): { id: string; detail: string; isResolved: boolean }[] => {
    const result: { id: string; detail: string; isResolved: boolean }[] = [];
    risks.forEach((risk) => {
      result.push({ id: risk.id, detail: risk.detail, isResolved: risk.isResolved });
    });
    return result;
  };

  return <CheckList title="Risk Log" listItems={formatRisks(risks)} wbsNum={wbsNum} />;
};

export default RiskLog;
