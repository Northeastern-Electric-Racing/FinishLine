/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import DesignReviewDetails from '../CalendarPage/EventDetailPage/EventDetails';
import CalendarTab from './CalendarTab';
import { EventAvailabilityPage } from './Components/EventAvailabilityPage';

const NewCalendar: React.FC = () => {
  return (
    <Switch>
      <Route exact path={`${routes.NEW_CALENDAR}/yourEvents`} component={CalendarTab} />
      <Route exact path={`${routes.NEW_CALENDAR}/reviews`} component={CalendarTab} />
      <Route exact path={`${routes.NEW_CALENDAR}/mainCalendar`} component={CalendarTab} />

      <Route path={`${routes.NEW_CALENDAR}/event/:eventId`} component={EventAvailabilityPage} />

      <Route path={routes.DESIGN_REVIEW_BY_ID} component={DesignReviewDetails} />

      <Route exact path={routes.NEW_CALENDAR} component={CalendarTab} />
    </Switch>
  );
};

export default NewCalendar;
