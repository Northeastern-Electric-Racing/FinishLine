/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import HorizontalList from '../../../components/horizontal-list';

interface RulesListProps {
  rules: string[];
}

const RulesList: React.FC<RulesListProps> = ({ rules }) => {
  return (
    <HorizontalList
      title={'Rules'}
      items={rules.map((r) => (
        <>{r}</>
      ))}
    />
  );
};

export default RulesList;
