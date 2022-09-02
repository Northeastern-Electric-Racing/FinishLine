/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import RiskLog from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RiskLog';

describe('Rendering Project Risk Log Component', () => {
  const testRisks = [
    { details: 'Risk #1', resolved: false },
    { details: 'Risk #2', resolved: true },
    { details: 'Risk #3', resolved: false }
  ];

  it('Renders the RiskLog title', () => {
    render(<RiskLog risks={testRisks} />);

    expect(screen.getByText('Risk Log')).toBeInTheDocument();
  });

  it('Renders all of the risks', () => {
    render(<RiskLog risks={testRisks} />);

    expect(screen.getByText('Risk #1')).toBeInTheDocument();
    expect(screen.getByText('Risk #2')).toBeInTheDocument();
    expect(screen.getByText('Risk #3')).toBeInTheDocument();
  });
});
