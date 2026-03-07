-- Phase 5: Collaboration & Social Layer
-- Enums
CREATE TYPE "CollaborationRequestStatus" AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE "GroupRole" AS ENUM ('owner', 'member');

-- Follows
CREATE TABLE "follows" (
  "follower_id" UUID NOT NULL,
  "following_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "following_id")
);

CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

ALTER TABLE "follows"
  ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Collaboration Requests
CREATE TABLE "collaboration_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sender_id" UUID NOT NULL,
  "receiver_id" UUID NOT NULL,
  "message" TEXT,
  "status" "CollaborationRequestStatus" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "collaboration_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "collaboration_requests_sender_id_idx" ON "collaboration_requests"("sender_id");
CREATE INDEX "collaboration_requests_receiver_id_idx" ON "collaboration_requests"("receiver_id");
CREATE INDEX "collaboration_requests_status_idx" ON "collaboration_requests"("status");

ALTER TABLE "collaboration_requests"
  ADD CONSTRAINT "collaboration_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "collaboration_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Groups
CREATE TABLE "groups" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "groups_created_by_idx" ON "groups"("created_by");

ALTER TABLE "groups"
  ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Group Members
CREATE TABLE "group_members" (
  "group_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "role" "GroupRole" NOT NULL DEFAULT 'member',
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "student_id")
);

CREATE INDEX "group_members_student_id_idx" ON "group_members"("student_id");

ALTER TABLE "group_members"
  ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notifications
CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Activity Logs
CREATE TABLE "activity_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "target_id" UUID,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_logs_actor_id_idx" ON "activity_logs"("actor_id");
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

ALTER TABLE "activity_logs"
  ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
