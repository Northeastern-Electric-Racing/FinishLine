/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import CheckList from '../../../components/CheckList';
import { Risk } from '../../../../../shared/src/types/risk-types';

interface RiskLogProps {
  risks: Risk[];
}

const RiskLog: React.FC<RiskLogProps> = ({ risks }) => {
  const formatRisks = (risks: Risk[]): { id: String; detail: string; isResolved: boolean }[] => {
    var result: { id: String; detail: string; isResolved: boolean }[] = [];
    risks.forEach((risk) => {
      result.push({ id: risk.id, detail: risk.detail, isResolved: risk.isResolved });
    });
    return result;
  };

  return <CheckList title="Risk Log" listItems={formatRisks(risks)} />;
};

export default RiskLog;
