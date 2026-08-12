/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React, { useState } from 'react';
import Tabs from '../../../components/Tabs';
import NewMemberMilestonesWidget from './NewMemberMilestonesWidget';
import NewMemberFAQsSection from './NewMemberFAQsSection';

const NewMemberMilestonesAndFAQsSection: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const tabs = [
    { label: 'Milestones', component: <NewMemberMilestonesWidget /> },
    { label: 'FAQs', component: <NewMemberFAQsSection /> }
  ];

  return <Tabs tabs={tabs} tabValue={tabValue} setTabValue={setTabValue} />;
};

export default NewMemberMilestonesAndFAQsSection;
