/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Landing page for the list of ruleset types
import React from 'react';
import PageLayout from '../../components/PageLayout';
import { NERButton } from '../../components/NERButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  const history = useHistory();

  return (
    <PageLayout title="Rules">
      {/* Placeholder to navigate when clicking on a ruleset type's view button*/}
      <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id`)}>FSAE</NERButton>
    </PageLayout>
  );
};

export default RulesetTypePage;
