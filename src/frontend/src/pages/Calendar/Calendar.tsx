/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import CalendarPage from './CalendarPage';

const Calendar: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.CALENDAR} component={CalendarPage} />
    </Switch>
  );
};

export default Calendar;
