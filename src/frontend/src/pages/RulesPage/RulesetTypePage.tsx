import React from 'react';
import PageLayout from '../../components/PageLayout';
import RulesetTypeTable from './components/RulesetTypeTable';

const RulesetTypePage: React.FC = () => {
  return (
    <PageLayout title="Ruleset Types">
      <RulesetTypeTable />
    </PageLayout>
  );
};

export default RulesetTypePage;
