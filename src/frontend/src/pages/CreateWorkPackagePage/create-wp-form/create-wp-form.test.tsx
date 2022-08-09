/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsPipe } from '../../../pipes';
import { mockUtils } from '../../../test-support/test-data/test-utils.stub';
import {
  exampleWbsWorkPackage1,
  exampleWbsWorkPackage2
} from '../../../test-support/test-data/wbs-numbers.stub';
import { render, screen } from '../../../test-support/test-utils';
import CreateWPFormView from './create-wp-form';

const mockDependencies = [wbsPipe(exampleWbsWorkPackage2), wbsPipe(exampleWbsWorkPackage1)];
const mockEA = ['yooooo', 'wassup', 'bruh', 'whoosh'];
const mockDeliverables = ['go vroom'];
const mockStates = {
  name: () => null,
  wbsNum: () => null,
  crId: () => null,
  startDate: () => null,
  duration: () => null
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (allowSubmit = true) => {
  return render(
    <CreateWPFormView
      states={mockStates}
      dependencies={mockDependencies}
      depUtils={mockUtils}
      expectedActivities={mockEA}
      eaUtils={mockUtils}
      deliverables={mockDeliverables}
      delUtils={mockUtils}
      onSubmit={() => null}
      onCancel={() => null}
      allowSubmit={allowSubmit}
    />
  );
};

describe('create wp form view test suite', () => {
  it('render title', () => {
    renderComponent();

    expect(screen.getByText('Create New Work Package')).toBeInTheDocument();
  });

  it('render wp name', () => {
    renderComponent();

    expect(screen.getByText('Work Package Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Work Package Name' })).toBeInTheDocument();
  });

  it('render project wbs num', () => {
    renderComponent();

    expect(screen.getByText('Project WBS Number')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Project WBS Number' })).toBeInTheDocument();
  });

  it('render start date', () => {
    renderComponent();

    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText('start date input')).toBeInTheDocument();
  });

  it('render duration', () => {
    renderComponent();

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByLabelText('duration')).toBeInTheDocument();
  });

  it('render dependencies', async () => {
    renderComponent();

    expect(screen.getByText('Dependencies')).toBeInTheDocument();
    const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
    expect(res.map((item) => item.value)).toEqual(expect.arrayContaining(mockDependencies));
  });

  it('render expected activities', async () => {
    renderComponent();

    expect(screen.getByText('Expected Activities')).toBeInTheDocument();
    const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
    expect(res.map((item) => item.value)).toEqual(expect.arrayContaining(mockEA));
  });

  it('render deliverables', async () => {
    renderComponent();

    expect(screen.getByText('Deliverables')).toBeInTheDocument();
    const res = (await screen.findAllByRole('textbox')) as HTMLInputElement[];
    expect(res.map((item) => item.value)).toEqual(expect.arrayContaining(mockDeliverables));
  });

  it('disables submit button when allowSubmit is false', () => {
    renderComponent(false);

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button when allowSubmit is true', () => {
    renderComponent(true);

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
