-- CreateTable
CREATE TABLE "Subscription" (
    "endpoint" TEXT NOT NULL,
    "expirationTime" INTEGER,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_endpoint_key" ON "Subscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
