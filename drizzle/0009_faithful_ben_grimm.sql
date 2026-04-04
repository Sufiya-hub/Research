CREATE TABLE "summarization_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summarization_history" ADD CONSTRAINT "summarization_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "summarization_history_user_idx" ON "summarization_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "summarization_history_created_at_idx" ON "summarization_history" USING btree ("created_at");