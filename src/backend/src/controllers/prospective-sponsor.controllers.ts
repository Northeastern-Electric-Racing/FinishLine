import { NextFunction, Request, Response } from 'express';
import ProspectiveSponsorServices from '../services/prospective-sponsor.services.js';

export default class ProspectiveSponsorController {
  static async createProspectiveSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        organizationName,
        lastContactDate,
        firstContactMethod,
        contactName,
        contactorUserId,
        highlightThresholdDays,
        contactEmail,
        contactPhone,
        contactPosition,
        notes
      } = req.body;

      const prospectiveSponsor = await ProspectiveSponsorServices.createProspectiveSponsor(
        req.currentUser,
        req.organization,
        organizationName,
        lastContactDate,
        firstContactMethod,
        contactName,
        contactorUserId,
        highlightThresholdDays,
        contactEmail,
        contactPhone,
        contactPosition,
        notes
      );
      res.status(200).json(prospectiveSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllProspectiveSponsors(req: Request, res: Response, next: NextFunction) {
    try {
      const prospectiveSponsors = await ProspectiveSponsorServices.getAllProspectiveSponsors(req.organization);
      res.status(200).json(prospectiveSponsors);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editProspectiveSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { prospectiveSponsorId } = req.params as Record<string, string>;
      const {
        organizationName,
        lastContactDate,
        status,
        firstContactMethod,
        contactName,
        contactorUserId,
        highlightThresholdDays,
        contactEmail,
        contactPhone,
        contactPosition,
        notes
      } = req.body;

      const updatedProspectiveSponsor = await ProspectiveSponsorServices.editProspectiveSponsor(
        req.currentUser,
        req.organization,
        prospectiveSponsorId,
        organizationName,
        lastContactDate,
        status,
        firstContactMethod,
        contactName,
        contactorUserId,
        highlightThresholdDays,
        contactEmail,
        contactPhone,
        contactPosition,
        notes
      );
      res.status(200).json(updatedProspectiveSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteProspectiveSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { prospectiveSponsorId } = req.params as Record<string, string>;
      const deletedProspectiveSponsor = await ProspectiveSponsorServices.deleteProspectiveSponsor(
        prospectiveSponsorId,
        req.currentUser,
        req.organization
      );
      res.status(200).json(deletedProspectiveSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getProspectiveSponsorTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { prospectiveSponsorId } = req.params as Record<string, string>;
      const tasks = await ProspectiveSponsorServices.getProspectiveSponsorTasks(
        prospectiveSponsorId,
        req.organization.organizationId
      );
      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createProspectiveSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { prospectiveSponsorId } = req.params as Record<string, string>;
      const { dueDate, notes, notifyDate, assigneeUserId } = req.body;

      const task = await ProspectiveSponsorServices.createProspectiveSponsorTask(
        req.currentUser,
        req.organization,
        prospectiveSponsorId,
        dueDate,
        notes,
        notifyDate,
        assigneeUserId
      );
      res.status(200).json(task);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async acceptProspectiveSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { prospectiveSponsorId } = req.params as Record<string, string>;
      const {
        sponsorTierId,
        valueTypes,
        sponsorValue,
        joinDate,
        activeYears,
        taxExempt,
        discountCode,
        sponsorNotes,
        stockDescription,
        discountDescription
      } = req.body;

      const acceptedProspectiveSponsor = await ProspectiveSponsorServices.acceptProspectiveSponsor(
        req.currentUser,
        req.organization,
        prospectiveSponsorId,
        sponsorTierId || undefined,
        valueTypes,
        joinDate,
        activeYears,
        taxExempt,
        sponsorValue,
        discountCode,
        sponsorNotes,
        stockDescription,
        discountDescription
      );
      res.status(200).json(acceptedProspectiveSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }
}
