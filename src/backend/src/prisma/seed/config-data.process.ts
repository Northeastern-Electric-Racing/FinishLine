import {
  Account_Code,
  Calendar,
  Description_Bullet_Type,
  Event_Type,
  Index_Code,
  Link_Type,
  Manufacturer,
  Material_Type,
  Reimbursement_Product_Other_Reason,
  Team_Type,
  Unit,
  Vendor
} from '@prisma/client';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { SeedProcess } from '../processes/seed-process.js';
import {
  accountCodeCreateInputs,
  calendarCreateInputs,
  descriptionBulletTypeCreateInputs,
  eventTypeConfigs,
  eventTypeCreateInput,
  indexCodeCreateInputs,
  linkTypeCreateInputs,
  manufacturerCreateInputs,
  materialTypeCreateInputs,
  otherReimbursementReasonConfigs,
  otherReimbursementReasonCreateInput,
  teamTypeCreateInputs,
  unitCreateInputs,
  vendorCreateInputs
} from '../factories/config-data.factory.js';

type ConfigDataInput = OrganizationOutput & UsersOutput;

export type ConfigDataOutput = {
  teamTypes: Team_Type[];
  linkTypes: Link_Type[];
  descriptionBulletTypes: Description_Bullet_Type[];
  materialTypes: Material_Type[];
  manufacturers: Manufacturer[];
  units: Unit[];
  accountCodes: Account_Code[];
  indexCodes: Index_Code[];
  vendors: Vendor[];
  reimbursementProductOtherReasons: Reimbursement_Product_Other_Reason[];
  calendars: Calendar[];
  eventTypes: Event_Type[];
};

export class ConfigDataProcess extends SeedProcess<ConfigDataInput, ConfigDataOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess];
  }

  async run({ organization, appAdmins }: ConfigDataInput): Promise<ConfigDataOutput> {
    const { organizationId } = organization;
    const [creator] = appAdmins;

    if (!creator) {
      throw new Error('ConfigDataProcess requires at least one app admin user.');
    }

    const teamTypes = await Promise.all(
      teamTypeCreateInputs(organizationId).map((data) => this.prisma.team_Type.create({ data }))
    );

    const linkTypes = await Promise.all(
      linkTypeCreateInputs(creator.userId, organizationId).map((data) => this.prisma.link_Type.create({ data }))
    );

    const descriptionBulletTypes = await Promise.all(
      descriptionBulletTypeCreateInputs(creator.userId, organizationId).map((data) =>
        this.prisma.description_Bullet_Type.create({ data })
      )
    );

    const materialTypes = await Promise.all(
      materialTypeCreateInputs(creator.userId, organizationId).map((data) => this.prisma.material_Type.create({ data }))
    );

    const manufacturers = await Promise.all(
      manufacturerCreateInputs(creator.userId, organizationId).map((data) => this.prisma.manufacturer.create({ data }))
    );

    const units = await Promise.all(
      unitCreateInputs(creator.userId, organizationId).map((data) => this.prisma.unit.create({ data }))
    );

    const accountCodes = await Promise.all(
      accountCodeCreateInputs(organizationId).map((data) => this.prisma.account_Code.create({ data }))
    );

    const accountCodeIdsByName = accountCodes.reduce<Record<string, string>>((acc, accountCode) => {
      acc[accountCode.name] = accountCode.accountCodeId;
      return acc;
    }, {});

    const indexCodes = await Promise.all(
      indexCodeCreateInputs(creator.userId, organizationId, accountCodeIdsByName).map((data) =>
        this.prisma.index_Code.create({ data })
      )
    );

    const indexCodeIdsByName = indexCodes.reduce<Record<string, string>>((acc, indexCode) => {
      acc[indexCode.name] = indexCode.indexCodeId;
      return acc;
    }, {});

    const vendors = await Promise.all(
      vendorCreateInputs(creator.userId, organizationId).map((data) => this.prisma.vendor.create({ data }))
    );

    const reimbursementProductOtherReasons = await Promise.all(
      otherReimbursementReasonConfigs.map((config) => {
        const indexCodeId = indexCodeIdsByName[config.indexCodeName];

        if (!indexCodeId) {
          throw new Error(`Missing index code for reimbursement reason: ${config.indexCodeName}`);
        }

        const accountCodeIds = config.accountCodeNames.map((accountCodeName) => {
          const accountCodeId = accountCodeIdsByName[accountCodeName];

          if (!accountCodeId) {
            throw new Error(`Missing account code for reimbursement reason: ${accountCodeName}`);
          }

          return accountCodeId;
        });

        return this.prisma.reimbursement_Product_Other_Reason.create({
          data: otherReimbursementReasonCreateInput(creator.userId, indexCodeId, accountCodeIds, config.name, config.budget)
        });
      })
    );

    const calendars = await Promise.all(
      calendarCreateInputs(creator.userId, organizationId).map((data) => this.prisma.calendar.create({ data }))
    );

    const calendarIdsByName = calendars.reduce<Record<string, string>>((acc, calendar) => {
      acc[calendar.name] = calendar.calendarId;
      return acc;
    }, {});

    const eventTypes = await Promise.all(
      eventTypeConfigs.map((config) =>
        this.prisma.event_Type.create({
          data: eventTypeCreateInput(creator.userId, organizationId, config, calendarIdsByName)
        })
      )
    );

    return {
      teamTypes,
      linkTypes,
      descriptionBulletTypes,
      materialTypes,
      manufacturers,
      units,
      accountCodes,
      indexCodes,
      vendors,
      reimbursementProductOtherReasons,
      calendars,
      eventTypes
    };
  }
}
