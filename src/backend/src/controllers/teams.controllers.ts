import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { teamRelationArgs, teamTransformer } from '../utils/teams.utils';
import { projectTransformer } from '../utils/projects.utils';

export const getAllTeams = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany(teamRelationArgs);
  return res.status(200).json(teams.map(teamTransformer));
};

export const getSingleTeam = async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { teamId: req.params.teamId },
    ...teamRelationArgs
  });

  if (!team) {
    return res.status(404).json({ message: `Team with id ${req.params.teamId} not found!` });
  }

  return res.status(200).json(teamTransformer(team));
};

export const getAllProjectsByTeam = async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { teamId: req.params.teamId },
    include: {
      projects: {
        include: {
          wbsElement: {
            include: {
              projectLead: true,
              projectManager: true,
              changes: {
                include: {
                  implementer: true
                }
              }
            }
          },
          team: true,
          goals: true,
          features: true,
          risks: {
            include: {
              project: {
                include: {
                  wbsElement: true
                }
              },
              createdBy: true,
              resolvedBy: true,
              deletedBy: true
            }
          },
          otherConstraints: true,
          workPackages: {
            include: {
              wbsElement: {
                include: {
                  projectLead: true,
                  projectManager: true,
                  changes: { include: { implementer: true } }
                }
              },
              dependencies: true,
              expectedActivities: true,
              deliverables: true
            }
          }
        }
      }
    }
  });

  if (!team) {
    return res.status(404).json({ message: `Team with id ${req.params.teamId} not found!` });
  }

  const projectReturn = team.projects.map(projectTransformer);

  return res.status(200).json(projectReturn);
};
