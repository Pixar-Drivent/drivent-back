import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import { prisma } from "@/config";

export async function verifyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!enrollment) {
      return generateErrorResponse(res, "NotFound");
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        enrollmentId: enrollment.id,
      },
    });

    if (!ticket) {
      return generateErrorResponse(res, "NotFound");
    }

    if (ticket.status === "RESERVED") {
      return generateErrorResponse(res, "PaymentRequired");
    }

    const ticketType = await prisma.ticketType.findFirst({
      where: {
        id: ticket.ticketTypeId,
      },
    });

    if (!ticketType || ticketType.isRemote) {
      return generateErrorResponse(res, "Unauthorized");
    }

    return next();
  } catch (err) {
    return generateErrorResponse(res, "BadRequest");
  }
}

function generateErrorResponse(res: Response, statusMessage: string) {
  if (statusMessage === "NotFound") {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  if (statusMessage === "PaymentRequired") {
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
  if (statusMessage === "Unauthorized") {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }

  return res.sendStatus(httpStatus.BAD_REQUEST);
}
