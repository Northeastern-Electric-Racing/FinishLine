/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import ProjectsTable from './projects-table';
import { Project } from 'shared';
import { wbsPipe, fullNamePipe, weeksPipe } from '../../../pipes';
import { wbsRegex } from '../../../test-support/test-utils';
import {
  exampleProject1,
  exampleProject2,
  exampleProject3,
  exampleProject4,
  exampleProject5,
  exampleAllProjects
} from '../../../test-support/test-data/projects.stub';

// Sets up the component under test with the desired values and renders it.
const renderComponent = (prjs: Project[]) => {
  const displayProjects = prjs.map((prj) => {
    return {
      wbsNum: wbsPipe(prj.wbsNum),
      name: prj.name,
      projectLead: fullNamePipe(prj.projectLead),
      projectManager: fullNamePipe(prj.projectManager),
      duration: weeksPipe(prj.workPackages.reduce((tot, cur) => tot + cur.duration, 0))
    };
  });

  render(<ProjectsTable allProjects={displayProjects} />);
};

describe('projects table component', () => {
  it('handles sorting and reverse sorting the table by project name', async () => {
    renderComponent(exampleAllProjects);

    const column: string = 'Name';
    const expectedWbsOrder: string[] = [
      exampleProject3,
      exampleProject2,
      exampleProject1,
      exampleProject4,
      exampleProject5
    ].map((prj: Project) => wbsPipe(prj.wbsNum));

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder.reverse());

    fireEvent.click(screen.getByText(column));
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder.reverse());
  });

  it('handles sorting and reverse sorting the table by project lead', async () => {
    renderComponent(exampleAllProjects);

    const column: string = 'Project Lead';
    const expectedWbsOrder: string[] = [
      exampleProject1,
      exampleProject2,
      exampleProject5,
      exampleProject3,
      exampleProject4
    ].map((prj: Project) => wbsPipe(prj.wbsNum));

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele) => ele.innerHTML)).not.toEqual(expectedWbsOrder);

    fireEvent.click(screen.getByText(column));
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder);
  });

  it('handles sorting and reverse sorting the table by project manager', async () => {
    renderComponent(exampleAllProjects);

    const column: string = 'Project Manager';
    const expectedWbsOrder: string[] = [
      exampleProject1,
      exampleProject4,
      exampleProject2,
      exampleProject3,
      exampleProject5
    ].map((prj: Project) => wbsPipe(prj.wbsNum));

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele) => ele.innerHTML)).not.toEqual(expectedWbsOrder);

    fireEvent.click(screen.getByText(column));
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder);
  });

  it('handles sorting and reverse sorting the table by duration', async () => {
    renderComponent(exampleAllProjects);

    const column: string = 'Duration';
    const expectedWbsOrder: string[] = [
      exampleProject2,
      exampleProject5,
      exampleProject3,
      exampleProject4,
      exampleProject1
    ].map((prj: Project) => wbsPipe(prj.wbsNum));

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder.reverse());

    fireEvent.click(screen.getByText(column));
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder.reverse());
  });

  it('handles sorting and reverse sorting the table by wbsNum', async () => {
    renderComponent(exampleAllProjects);

    const column: string = 'WBS #';
    const expectedWbsOrder: string[] = [
      exampleProject5,
      exampleProject4,
      exampleProject3,
      exampleProject2,
      exampleProject1
    ].map((prj: Project) => wbsPipe(prj.wbsNum));

    fireEvent.click(screen.getByText(column));
    const wbsNumsDesc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsDesc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder);

    fireEvent.click(screen.getByText(column));
    const wbsNumsAsc: HTMLElement[] = await screen.findAllByText(wbsRegex);
    expect(wbsNumsAsc.map((ele) => ele.innerHTML)).toEqual(expectedWbsOrder.reverse());
  });
});
