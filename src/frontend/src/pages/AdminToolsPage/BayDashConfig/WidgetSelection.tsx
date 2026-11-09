/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAvailableBayDashboardWidgets } from '../../../hooks/bay-dashboard.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import {
  BayDashboardWidgetSelection,
  bayDashboardWidgetDisplayNames,
  bayDashboardWidgetSizes
} from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import WidgetSizeDropdown from './WidgetSizeDropdown';

interface WidgetSelectionProps {
  // highlighted widget per size, only one per size (until phase 3 widget rotations)
  selection: BayDashboardWidgetSelection;
  onSelectionChange: (selection: BayDashboardWidgetSelection) => void;
  // the text a size's text field widget shows
  getText: (size: BayDashboardWidgetSize) => string | undefined;
  onEditText: (size: BayDashboardWidgetSize) => void;
}

/**
 * Dropdowns listing the widgets available for each slot size.
 * Clicking a widget highlights it, one per size, and clicking it again unselects it.
 * A text field widget can only be highlighted once it has text.
 */
const WidgetSelection: React.FC<WidgetSelectionProps> = ({ selection, onSelectionChange, getText, onEditText }) => {
  const { data: availableWidgets, isLoading, isError, error } = useAvailableBayDashboardWidgets();
  const toast = useToast();

  const handleSelect = (size: BayDashboardWidgetSize, type: BayDashboardWidgetType) => {
    const widgetName = bayDashboardWidgetDisplayNames[type];
    const sizeName = size.toLowerCase();
    if (selection[size]?.type === type) {
      onSelectionChange({ ...selection, [size]: undefined });
      toast.success(`Removed ${sizeName} ${widgetName} widget`);
      return;
    }

    const text = type === BayDashboardWidgetType.TEXT_FIELD ? getText(size) : undefined;
    if (type === BayDashboardWidgetType.TEXT_FIELD && !text?.trim()) {
      toast.error(`Add text to the ${sizeName} text field before selecting it`);
      return;
    }

    onSelectionChange({ ...selection, [size]: { type, text } });
    toast.success(`Added ${sizeName} ${widgetName} widget`);
  };

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !availableWidgets) return <LoadingIndicator />;

  return (
    <>
      {bayDashboardWidgetSizes.map((size) => (
        <WidgetSizeDropdown
          key={size}
          size={size}
          widgets={availableWidgets.widgets.filter((widget) => widget.sizes.includes(size))}
          selectedType={selection[size]?.type}
          text={getText(size)}
          onSelect={(type) => handleSelect(size, type)}
          onEditText={() => onEditText(size)}
        />
      ))}
    </>
  );
};

export default WidgetSelection;
