-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "localId" INTEGER NOT NULL,
    "StartTime" TIMESTAMP(6) NOT NULL,
    "EndTime" TIMESTAMP(6) NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Local" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "User_Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Local_name_key" ON "Local"("name");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Activity" ADD CONSTRAINT "User_Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Activity" ADD CONSTRAINT "User_Activity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
