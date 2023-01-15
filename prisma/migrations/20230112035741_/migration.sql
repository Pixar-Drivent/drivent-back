-- CreateTable
CREATE TABLE "Payment_Url" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" VARCHAR(511) NOT NULL,

    CONSTRAINT "Payment_Url_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment_Url" ADD CONSTRAINT "Payment_Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
