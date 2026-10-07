-- CreateTable
CREATE TABLE "User_API_Token" (
    "apiTokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "tokenHash" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "dateRevoked" TIMESTAMP(3),

    CONSTRAINT "User_API_Token_pkey" PRIMARY KEY ("apiTokenId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_API_Token_tokenHash_key" ON "User_API_Token"("tokenHash");

-- CreateIndex
CREATE INDEX "User_API_Token_userId_idx" ON "User_API_Token"("userId");

-- AddForeignKey
ALTER TABLE "User_API_Token" ADD CONSTRAINT "User_API_Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
