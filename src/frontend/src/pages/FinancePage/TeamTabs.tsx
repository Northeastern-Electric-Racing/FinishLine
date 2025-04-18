import React, { useState } from 'react';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { AuthenticatedUser, isHead, isLead, ProjectPreview, RoleEnum, Team } from 'shared';
import { useGetUsersTeamsProjects } from '../../hooks/projects.hooks';

interface ProjectTabsProps {
    user: AuthenticatedUser;
    onTabSelect: (tab: string) => void;
  };

export const TeamTabs: React.FC<ProjectTabsProps> = ({ user, onTabSelect }) => {
    let teams: Team[] = [];
    if (user.role === RoleEnum.HEAD) {
        teams = user.teamsAsHead ?? [];
    } else if (user.role === RoleEnum.LEADERSHIP || user.role === RoleEnum.MEMBER) {
      teams = user.teamsAsLead ?? [];
    }
    
  const [activeTab, setActiveTab] = useState('');
  const tabs = [teams.map((team) => team.teamName)];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabSelect(tab);
  };

  return (
    <div className="flex border-b border-gray-700 space-x-6 text-white text-lg font-medium">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`pb-2 transition-all duration-200 ${
            activeTab === tab ? 'border-b-4 border-red-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
