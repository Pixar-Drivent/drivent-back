import { AuthenticatedRequest } from "@/middlewares";
import ticketService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketTypes = await ticketService.getTicketTypes();

    return res.status(httpStatus.OK).send(ticketTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const ticketTypes = await ticketService.getTicketByUserId(userId);

    return res.status(httpStatus.OK).send(ticketTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  //TODO validação do JOI
  const { ticketTypeId } = req.body;

  if (!ticketTypeId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const ticketTypes = await ticketService.createTicket(userId, ticketTypeId);

    return res.status(httpStatus.CREATED).send(ticketTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createTicketType(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketInfo } = req.body;

  if (!ticketInfo) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const createdTicketType = await ticketService.createTicketType(
      ticketInfo.name,
      +ticketInfo.price,
      ticketInfo.isRemote,
      ticketInfo.includesHotel,
    );
    const createdTicket = await ticketService.createTicket(+userId, createdTicketType.id);
    return res.status(httpStatus.CREATED).send({ ...createdTicket, ...createdTicketType });
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
