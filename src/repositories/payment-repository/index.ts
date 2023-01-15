import { prisma } from "@/config";
import { Payment } from "@prisma/client";
import Stripe from "stripe";

const stripeDevelopersKey = process.env.STRIPE_KEY;

const stripe = new Stripe(stripeDevelopersKey, {
  apiVersion: "2022-11-15",
});

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function handleNewPayment(userId: number, ticketId: number) {
  const SUCCESS_URL = "http://localhost:3000/dashboard/payment-verification";
  const FAILURE_URL = "http://localhost:3000/dashboard/payment";

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
    }
  });

  const ticket = await prisma.ticket.findFirst({
    where: {
      enrollmentId: enrollment.id
    }
  });

  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticket.ticketTypeId
    }
  });

  interface TicketInfoInterface {
    online: {
      price: number,
      text: string,
    },
    hasHotel: {
      price: number,
      text: string,
    },
    noHotel: {
      price: number,
      text: string,
    },
    null: {
      price: number,
      text: string,
    },  
  }

  const ticketInfo: TicketInfoInterface = {
    online: {
      price: 100,
      text: "Online"
    },
    hasHotel: {
      price: 600,
      text: "Presencial + Hotel"
    },
    noHotel: {
      price: 250,
      text: "Presencial"
    },
    null: {
      price: 0,
      text: "Error"
    }
  };

  let ticketUserInfo = null;
  if (ticketType.isRemote) {
    ticketUserInfo = "online";
  } else {
    if (ticketType.includesHotel) {
      ticketUserInfo = "hasHotel";
    } else {
      ticketUserInfo = "noHotel";
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "brl",
        product_data: {
          name: ticketInfo[ticketUserInfo  as keyof TicketInfoInterface].text
        },
        unit_amount: ticketInfo[ticketUserInfo  as keyof TicketInfoInterface].price*100,
      },
      quantity: 1,
    }],
    success_url: `${SUCCESS_URL}`,
    cancel_url: `${FAILURE_URL}`,
  });  

  //store url in db
  await prisma.payment_Url.upsert({
    where: {
      userId: userId,
    },
    create: {
      userId: userId,
      url: session.id
    },
    update: {
      url: session.id
    }
  });

  return session.url;
}

async function verifyPayment(userId: number) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
    }
  });

  const ticket = await prisma.ticket.findFirst({
    where: {
      enrollmentId: enrollment.id
    }
  });

  if (ticket.status === "PAID") {
    return true;
  }
  const paymentUrl = await prisma.payment_Url.findFirst({
    where: {
      userId: userId
    }
  });

  if (!paymentUrl) {
    return false;
  }

  const event = await stripe.checkout.sessions.retrieve(paymentUrl.url);

  if (event.payment_status === "paid") {
    await prisma.ticket.update({
      where: {
        id: ticket.id
      },
      data: {
        status: "PAID"
      },
    });
    return true;
  } else {
    return false;
  }
}

export type PaymentParams = Omit<Payment, "id" | "createdAt" | "updatedAt">;

const paymentRepository = {
  findPaymentByTicketId,
  handleNewPayment,
  verifyPayment
};

export default paymentRepository;
