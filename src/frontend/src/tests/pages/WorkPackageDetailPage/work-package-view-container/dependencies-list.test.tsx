/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../../test-support/test-utils';
import { exampleWorkPackage2 } from '../../../../test-support/test-data/work-packages.stub';
import { wbsPipe } from '../../../../pipes';
// import DependenciesList from './dependencies-list';
// import { FormContext } from '../../work-package-container';

// Sets up the component under test with the desired values and renders it
const renderComponent = (editMode?: boolean, path?: string, route?: string) => {
  // TODO: Cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const RouterWrapper = routerWrapperBuilder({ path, route });
  // const setField = (field: string, value: any) => {};
  return render(
    <p>it's fucked</p>
    // <RouterWrapper>
    //   {editMode ? (
    //     <FormContext.Provider value={{ editMode, setField }}>
    //       <DependenciesList dependencies={exampleWorkPackage2.dependencies} />
    //     </FormContext.Provider>
    //   ) : (
    //     <DependenciesList dependencies={exampleWorkPackage2.dependencies} />
    //   )}
    // </RouterWrapper>
  );
};

describe.skip('Rendering Work Package Dependencies Component', () => {
  test('Rendering example 2', () => {
    renderComponent();
    expect(screen.getByText(`Dependencies`)).toBeInTheDocument();

    exampleWorkPackage2.dependencies.forEach((wbs) => {
      expect(screen.getByText(`${wbsPipe(wbs)}`)).toBeInTheDocument();
    });
  });
  test('Rendering example 2, in edit mode', () => {
    renderComponent(true);
    expect(screen.getByText(`Dependencies`)).toBeInTheDocument();

    exampleWorkPackage2.dependencies.forEach((wbs) => {
      expect(screen.getByText(`${wbsPipe(wbs)}`)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('New WBS #')).toBeInTheDocument();
  });
});
