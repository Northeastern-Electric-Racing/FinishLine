/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { MemberDropdownItem, ProjectDropdownItem, TeamDropdownItem, WorkPackageDropdownItem } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const getAllProjectsDropdown = () => axios.get<ProjectDropdownItem[]>(apiUrls.projectsDropdown());

export const getAllWorkPackagesDropdown = () => axios.get<WorkPackageDropdownItem[]>(apiUrls.workPackagesDropdown());

export const getAllMembersDropdown = () => axios.get<MemberDropdownItem[]>(apiUrls.membersDropdown());

export const getAllTeamsDropdown = () => axios.get<TeamDropdownItem[]>(apiUrls.teamsDropdown());
