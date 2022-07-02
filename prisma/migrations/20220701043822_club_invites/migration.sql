-- CreateTable
CREATE TABLE "ClubInvite" (
    "clubId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,

    CONSTRAINT "ClubInvite_pkey" PRIMARY KEY ("inviterId","inviteeId","clubId")
);

-- AddForeignKey
ALTER TABLE "ClubInvite" ADD CONSTRAINT "ClubInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubInvite" ADD CONSTRAINT "ClubInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubInvite" ADD CONSTRAINT "ClubInvite_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
