/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { render, screen, routerWrapperBuilder } from '../../../../test-support/test-utils';
import { wbsPipe, listPipe, endDatePipe, datePipe } from '../../../../pipes';
import {
  exampleWorkPackage1,
  exampleWorkPackage2,
  exampleWorkPackage3
} from '../../../../test-support/test-data/work-packages.stub';
import WorkPackageSummary from './work-package-summary';

// Sets up the component under test with the desired values and renders it
const renderComponent = (wps: WorkPackage, path?: string, route?: string) => {
  const RouterWrapper = routerWrapperBuilder({ path, route });
  return render(
    <RouterWrapper>
      <WorkPackageSummary workPackage={wps} />
    </RouterWrapper>
  );
};

describe('Rendering Work Package Summary Test', () => {
  it('renders all the fields, example 1', () => {
    const wp: WorkPackage = exampleWorkPackage1;
    renderComponent(wp);
    expect(screen.getByText(`${wp.name}`)).toBeInTheDocument();
    expect(screen.getByText(`${wbsPipe(wp.wbsNum)}`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.duration} weeks`)).toBeInTheDocument();
    expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    wp.expectedActivities.slice(0, 3).forEach((expectedActivity) => {
      expect(screen.getByText(`${expectedActivity.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(`Show ${wp.expectedActivities.length - 3} more...`, { exact: false })
    ).not.toBeInTheDocument();
    wp.deliverables.slice(0, 3).forEach((deliverable) => {
      expect(screen.getByText(`${deliverable.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(`Show ${wp.deliverables.length - 3} more...`, { exact: false })
    ).not.toBeInTheDocument();
  });

  it('renders all the fields, example 2', () => {
    const wp: WorkPackage = exampleWorkPackage2;
    renderComponent(wp);
    expect(screen.getByText(`${wp.name}`)).toBeInTheDocument();
    expect(screen.getByText(`${wbsPipe(wp.wbsNum)}`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.duration} weeks`)).toBeInTheDocument();
    expect(screen.getByText(`${listPipe(wp.dependencies, wbsPipe)}`)).toBeInTheDocument();
    expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    wp.expectedActivities.slice(0, 3).forEach((expectedActivity) => {
      expect(screen.getByText(`${expectedActivity.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(`Show ${wp.expectedActivities.length - 3} more...`, { exact: false })
    ).not.toBeInTheDocument();
    wp.deliverables.slice(0, 3).forEach((deliverable) => {
      expect(screen.getByText(`${deliverable.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(`Show ${wp.deliverables.length - 3} more...`, { exact: false })
    ).not.toBeInTheDocument();
  });

  it('renders all the fields, example 3', () => {
    const wp: WorkPackage = exampleWorkPackage3;
    renderComponent(wp);
    expect(screen.getByText(`${wp.name}`)).toBeInTheDocument();
    expect(screen.getByText(`${wbsPipe(wp.wbsNum)}`)).toBeInTheDocument();
    expect(screen.getByText(`${wp.duration} weeks`)).toBeInTheDocument();
    expect(screen.getByText(`${listPipe(wp.dependencies, wbsPipe)}`)).toBeInTheDocument();
    expect(screen.getByText(`${datePipe(wp.startDate)}`, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(`${endDatePipe(wp.startDate, wp.duration)}`, { exact: false })
    ).toBeInTheDocument();
    wp.expectedActivities.slice(0, 3).forEach((expectedActivity) => {
      expect(screen.getByText(`${expectedActivity.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.getByText(`Show ${wp.expectedActivities.length - 3} more...`, { exact: false })
    ).toBeInTheDocument();
    wp.deliverables.slice(0, 3).forEach((deliverable) => {
      expect(screen.getByText(`${deliverable.detail}`)).toBeInTheDocument();
    });
    expect(
      screen.queryByText(`Show ${wp.deliverables.length - 3} more...`, { exact: false })
    ).not.toBeInTheDocument();
  });
});
