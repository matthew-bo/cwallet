-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "walletAddress" TEXT NOT NULL,
    "nickname" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_userId_lastUsedAt_idx" ON "contacts"("userId", "lastUsedAt");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_userId_email_key" ON "contacts"("userId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_userId_walletAddress_key" ON "contacts"("userId", "walletAddress");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
