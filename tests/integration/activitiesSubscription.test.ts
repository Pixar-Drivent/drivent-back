import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
} from "../factories";
import * as jwt from "jsonwebtoken";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { createActivity, createLocal, createUserActivity } from "../factories/activitiesSubscription-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/activities");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when user ticket is reserved", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeRemote();
      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 403 when user is trying to insert already inserted activity", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activity = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const userActivity = await createUserActivity(activity.id, user.id);

        const body = {
          activityId: activity.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 409 when user is trying to insert activity with time conflict (right intersection)", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activityFirst = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const activityConflict = await createActivity(local.id, "09:30", "10:30", 10, "2023-01-09");
        const userActivity = await createUserActivity(activityFirst.id, user.id);

        const body = {
          activityId: activityConflict.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.CONFLICT);
      });

      it("should respond with status 409 when user is trying to insert activity with time conflict (left intersection)", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activityFirst = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const activityConflict = await createActivity(local.id, "08:30", "09:30", 10, "2023-01-09");
        const userActivity = await createUserActivity(activityFirst.id, user.id);

        const body = {
          activityId: activityConflict.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.CONFLICT);
      });

      it("should respond with status 409 when user is trying to insert activity with time conflict (outer intersection)", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activityFirst = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const activityConflict = await createActivity(local.id, "08:30", "10:30", 10, "2023-01-09");
        const userActivity = await createUserActivity(activityFirst.id, user.id);

        const body = {
          activityId: activityConflict.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.CONFLICT);
      });

      it("should respond with status 409 when user is trying to insert activity with time conflict (inner intersection)", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activityFirst = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const activityConflict = await createActivity(local.id, "09:15", "09:45", 10, "2023-01-09");
        const userActivity = await createUserActivity(activityFirst.id, user.id);

        const body = {
          activityId: activityConflict.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.CONFLICT);
      });

      it("should respond with status 200 and insert when valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activity = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");

        const body = {
          activityId: activity.id,
        };

        const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.OK);
      });
    });
  });
});

describe("DELETE /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.delete("/activities");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when user ticket is reserved", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeRemote();
      const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    describe("when ticket is valid", () => {
      it("should return 404 if trying to delete a non existing activity", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);

        const body = {
          activityId: -1,
        };

        const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it("should return 404 if trying to delete an activity that does not belong to user", async () => {
        const user = await createUser();
        const userWrong = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activity = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const userWrongActivity = await createUserActivity(activity.id, userWrong.id);

        const body = {
          activityId: activity.id,
        };

        const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it("should return 200 and delete activity when valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const local = await createLocal();
        const activity = await createActivity(local.id, "09:00", "10:00", 10, "2023-01-09");
        const userActivity = await createUserActivity(activity.id, user.id);

        const body = {
          activityId: activity.id,
        };

        const response = await server.delete("/activities").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toEqual(httpStatus.OK);
      });
    });
  });
});
