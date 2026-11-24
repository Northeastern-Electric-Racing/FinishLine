import { Organization } from '@prisma/client';
import { BaseDateMarker, isAdmin, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBaseDateMarkerQueryArgs } from '../prisma-query-args/date-markers.query-args.js';
import { baseDateMarkerTransformer } from '../transformers/date-markers.transformer.js';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

export default class DateMarkersService {
  /**
   * Gets all of the organization's non-deleted date markers, earliest first.
   *
   * @param organization the organization to get the date markers of
   * @returns the organization's date markers
   */
  static async getAllDateMarkers(organization: Organization): Promise<BaseDateMarker[]> {
    const dateMarkers = await prisma.date_Marker.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      ...getBaseDateMarkerQueryArgs()
    });

    return dateMarkers.map(baseDateMarkerTransformer);
  }

  /**
   * Creates a date marker.
   *
   * @param submitter the user creating the date marker, who must be an admin
   * @param name the name of the date marker
   * @param date the calendar day the date marker falls on
   * @param organization the organization the date marker belongs to
   * @throws AccessDeniedAdminOnlyException if the submitter is not an admin
   */
  static async createDateMarker(submitter: User, name: string, date: Date, organization: Organization): Promise<void> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create date markers');
    }

    await prisma.date_Marker.create({
      data: {
        name,
        date,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      }
    });
  }

  /**
   * Edits a date marker.
   *
   * @param submitter the user editing the date marker, who must be an admin
   * @param dateMarkerId the id of the date marker to edit
   * @param name the new name of the date marker
   * @param date the new calendar day the date marker falls on
   * @param organization the organization the date marker belongs to
   * @throws AccessDeniedAdminOnlyException if the submitter is not an admin
   * @throws NotFoundException if the date marker does not exist
   * @throws DeletedException if the date marker has been deleted
   * @throws InvalidOrganizationException if the date marker is not in the organization
   */
  static async editDateMarker(
    submitter: User,
    dateMarkerId: string,
    name: string,
    date: Date,
    organization: Organization
  ): Promise<void> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('edit date markers');
    }

    await DateMarkersService.validateDateMarker(dateMarkerId, organization);

    await prisma.date_Marker.update({
      where: { dateMarkerId },
      data: { name, date }
    });
  }

  /**
   * Soft deletes a date marker.
   *
   * @param submitter the user deleting the date marker, who must be an admin
   * @param dateMarkerId the id of the date marker to delete
   * @param organization the organization the date marker belongs to
   * @throws AccessDeniedAdminOnlyException if the submitter is not an admin
   * @throws NotFoundException if the date marker does not exist
   * @throws DeletedException if the date marker has already been deleted
   * @throws InvalidOrganizationException if the date marker is not in the organization
   */
  static async deleteDateMarker(submitter: User, dateMarkerId: string, organization: Organization): Promise<void> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete date markers');
    }

    await DateMarkersService.validateDateMarker(dateMarkerId, organization);

    await prisma.date_Marker.update({
      where: { dateMarkerId },
      data: { dateDeleted: new Date(), userDeletedId: submitter.userId }
    });
  }

  /**
   * Ensures a date marker exists, is not deleted, and belongs to the organization.
   *
   * @throws NotFoundException if the date marker does not exist
   * @throws DeletedException if the date marker has been deleted
   * @throws InvalidOrganizationException if the date marker is not in the organization
   */
  private static async validateDateMarker(dateMarkerId: string, organization: Organization): Promise<void> {
    const dateMarker = await prisma.date_Marker.findUnique({
      where: { dateMarkerId },
      select: { dateDeleted: true, organizationId: true }
    });

    if (!dateMarker) throw new NotFoundException('Date Marker', dateMarkerId);
    if (dateMarker.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Date Marker');
    if (dateMarker.dateDeleted) throw new DeletedException('Date Marker', dateMarkerId);
  }
}
