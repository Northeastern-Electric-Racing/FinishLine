/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Form } from 'react-bootstrap';
import { Project } from 'shared';

import PageBlock from '../../../../layouts/page-block/page-block';

interface ProjectEditSummaryProps {
  project: Project;
  updateSummary: (val: string) => void;
}

const ProjectEditSummary: React.FC<ProjectEditSummaryProps> = ({ project, updateSummary }) => {
  return (
    <PageBlock title={'Project Summary'}>
      <Form.Group>
        <Form.Control
          required
          as="textarea"
          defaultValue={project.summary}
          rows={4}
          onChange={(e) => updateSummary(e.target.value)}
        />
      </Form.Group>
    </PageBlock>
  );
};

export default ProjectEditSummary;
