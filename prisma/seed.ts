import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function createHotelandRooms() {
  const hotel = await prisma.hotel.findFirst();
  if (hotel) return;
  
  const hotelI = await prisma.hotel.create({
    data: {
        name: "Contemporary Resort",
        image: "https://nthp-savingplaces.s3.amazonaws.com/2015/10/04/19/28/17/528/ContemporaryHotel1_Courtesy_Christian_Lambert_Flickr.jpg"
    }
  });
  const hotelII = await prisma.hotel.create({
    data: {
        name: "Grand Floridan Resort",
        image: "https://c8y3s8d4.stackpathcdn.com/wp-content/uploads/2018/02/The-Villas-at-Disneys-Grand-Floridian-Resort-and-Spa.jpeg"
    }
  });

  console.log({hotels:[hotelI, hotelII]});

  await prisma.room.createMany({
    data: [
      {name: "1001", capacity: 1, hotelId: hotelI.id},
      {name: "1002", capacity: 1, hotelId: hotelI.id},
      {name: "1003", capacity: 2, hotelId: hotelI.id},
      {name: "1004", capacity: 2, hotelId: hotelI.id},
      {name: "1005", capacity: 2, hotelId: hotelI.id},
      {name: "1006", capacity: 3, hotelId: hotelI.id},
      {name: "1007", capacity: 3, hotelId: hotelI.id},
      {name: "1008", capacity: 3, hotelId: hotelI.id},
      {name: "1009", capacity: 3, hotelId: hotelI.id},
    ]
  });
  await prisma.room.createMany({
    data: [
      {name: "2001", capacity: 3, hotelId: hotelII.id},
      {name: "2002", capacity: 3, hotelId: hotelII.id},
      {name: "2003", capacity: 3, hotelId: hotelII.id},
      {name: "2004", capacity: 3, hotelId: hotelII.id},
    ]
  });

  const genericUser = await prisma.user.create({
    data: {
      email: "generic",
      password: "generic"
    }
  });
  const firstRoom = await prisma.room.findFirst({
    where: {
      hotelId: hotelI.id
    }
  });
  if (!firstRoom) return console.error({error: 'Unable to seed booking'});
  const userId = genericUser.id;
  const roomId = firstRoom.id;

  const booking = await prisma.booking.createMany({
    data: [
      {userId, roomId: roomId+1},

      {userId, roomId: roomId+3},
      {userId, roomId: roomId+4}, {userId, roomId: roomId+4},

      {userId, roomId: roomId+6},
      {userId, roomId: roomId+7}, {userId, roomId: roomId+7},
      {userId, roomId: roomId+8}, {userId, roomId: roomId+8}, {userId, roomId: roomId+8},

      {userId, roomId: roomId+9}, {userId, roomId: roomId+9},
      {userId, roomId: roomId+11},
    ]
  });
  console.log({booking});
}

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }

  console.log({ event });
  createHotelandRooms();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
