/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import { exampleWorkPackage2 } from '../test-support/test-data/work-packages.stub';
import DescriptionList from '../../components/DescriptionList';

describe('Rendering Description List Component', () => {
  it('renders the component title', () => {
    render(<DescriptionList title={'Description'} items={exampleWorkPackage2.expectedActivities} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders all bullets', () => {
    render(<DescriptionList title={'test'} items={exampleWorkPackage2.expectedActivities} />);

    expect(
      screen.getByText(
        'Build a test procedure for destructively measuring the shear strength of various adhesives interacting with foam and steel plates'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Design and manufacture test fixtures to perform destructive testing')).toBeInTheDocument();
    expect(screen.getByText('Write a report to summarize findings')).toBeInTheDocument();
  });
});
