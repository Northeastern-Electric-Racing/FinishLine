/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import CheckList from '../../../components/check-list';

interface RiskLogProps {
  risks: { details: string; resolved: boolean }[];
}

const RiskLog: React.FC<RiskLogProps> = ({ risks }) => {
  return <CheckList title="Risk Log" listItems={risks} />;
};

export default RiskLog;
