-- CreateTable
CREATE TABLE "Message_Info" (
    "messageInfoId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "changeRequestId" INTEGER NOT NULL,

    CONSTRAINT "Message_Info_pkey" PRIMARY KEY ("messageInfoId")
);

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;
