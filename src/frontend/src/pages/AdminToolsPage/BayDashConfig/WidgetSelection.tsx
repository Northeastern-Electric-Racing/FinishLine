/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAvailableBayDashboardWidgets } from '../../../hooks/bay-dashboard.hooks';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import { bayDashboardWidgetSizes } from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import WidgetSizeDropdown from './WidgetSizeDropdown';

interface WidgetSelectionViewProps {
  slug: string;
}

const WidgetSelectionView: React.FC<WidgetSelectionViewProps> = ({ slug }) => {
  const { data: availableWidgets, isLoading, isError, error } = useAvailableBayDashboardWidgets(slug);
  // highlighted widget per size, only one per size (until phase 3 widget rotations)
  const [selected, setSelected] = useState<Partial<Record<BayDashboardWidgetSize, BayDashboardWidgetType>>>({});

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !availableWidgets) return <LoadingIndicator />;

  return (
    <>
      {bayDashboardWidgetSizes.map((size) => (
        <WidgetSizeDropdown
          key={size}
          title={size.charAt(0) + size.slice(1).toLowerCase()}
          widgets={availableWidgets.widgets.filter((widget) => widget.sizes.includes(size))}
          selectedType={selected[size]}
          onSelect={(type) => setSelected((prev) => ({ ...prev, [size]: prev[size] === type ? undefined : type }))}
        />
      ))}
    </>
  );
};

/**
 * Dropdowns listing the widgets available for each slot size. 
 * Clicking a widget highlights it, one per size, and clicking it again unselects it.
 */
const WidgetSelection: React.FC = () => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !organization) return <LoadingIndicator />;

  return <WidgetSelectionView slug={organization.slug} />;
};

export default WidgetSelection;
