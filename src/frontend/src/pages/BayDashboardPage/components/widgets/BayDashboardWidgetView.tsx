/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardWidgetType } from 'shared';
import { BayDashboardWidgetProps } from '../../../../utils/bay-dashboard.utils';
import CalendarWidget from './CalendarWidget';
import OverdueWorkPackagesWidget from './OverdueWorkPackagesWidget';
import TextFieldWidget from './TextFieldWidget';

const widgetComponents: Partial<Record<BayDashboardWidgetType, React.FC<BayDashboardWidgetProps>>> = {
  [BayDashboardWidgetType.CALENDAR]: CalendarWidget,
  [BayDashboardWidgetType.OVERDUE_WORK_PACKAGES]: OverdueWorkPackagesWidget,
  [BayDashboardWidgetType.TEXT_FIELD]: TextFieldWidget
};

/**
 * Renders the component for a widget's type at the size of the slot it's in.
 * Used by both the TV grid and the Admin Tools dropdowns so a widget looks the same in both.
 */
const BayDashboardWidgetView: React.FC<BayDashboardWidgetProps> = (props) => {
  const WidgetComponent = widgetComponents[props.widget.type];
  return WidgetComponent ? <WidgetComponent {...props} /> : null;
};

export default BayDashboardWidgetView;
