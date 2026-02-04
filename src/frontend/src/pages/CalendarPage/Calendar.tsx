/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import CalendarTab from './CalendarTab';
import { EventAvailabilityPage } from './Components/EventAvailabilityPage';

const Calendar: React.FC = () => {
  return (
    <Switch>
      <Route exact path={`${routes.CALENDAR}/yourEvents`} component={CalendarTab} />
      <Route exact path={`${routes.CALENDAR}/reviews`} component={CalendarTab} />
      <Route exact path={`${routes.CALENDAR}}/mainCalendar`} component={CalendarTab} />
      <Route path={`${routes.CALENDAR}/event/:eventId`} component={EventAvailabilityPage} />
      <Route exact path={routes.CALENDAR} component={CalendarTab} />
    </Switch>
  );
};

export default Calendar;
