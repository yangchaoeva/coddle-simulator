CREATE TABLE "dialogue_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"round_number" integer NOT NULL,
	"user_raw_input" text NOT NULL,
	"girlfriend_response" text NOT NULL,
	"emotion_before" integer NOT NULL,
	"emotion_change" integer NOT NULL,
	"emotion_after" integer NOT NULL,
	"trust_before" integer NOT NULL,
	"trust_change" integer NOT NULL,
	"trust_after" integer NOT NULL,
	"risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skill_scores" jsonb,
	"round_feedback" text,
	"input_status" varchar(30) DEFAULT 'valid' NOT NULL,
	"ai_fallback_used" boolean DEFAULT false NOT NULL,
	"ai_error_type" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emergency_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_input" text NOT NULL,
	"emotion_analysis" text NOT NULL,
	"hidden_need" text,
	"risk_warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reply_strategy" text,
	"suggested_reply" text,
	"do_not_say" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"matched_character_type" varchar(50),
	"user_consented_to_save" boolean DEFAULT false NOT NULL,
	"converted_to_training" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_key" varchar(50) NOT NULL,
	"character_type" varchar(50) NOT NULL,
	"scene_name" text NOT NULL,
	"background" text NOT NULL,
	"opening_line" text NOT NULL,
	"task_target" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"initial_emotion_score" integer DEFAULT -50 NOT NULL,
	"initial_trust_score" integer DEFAULT 50 NOT NULL,
	"training_focus" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reference_replies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risk_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "levels_level_key_unique" UNIQUE("level_key")
);
--> statement-breakpoint
CREATE TABLE "score_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"total_score" integer NOT NULL,
	"grade" varchar(10) NOT NULL,
	"ending_type" varchar(30) NOT NULL,
	"emotion_recognition" integer NOT NULL,
	"empathy" integer NOT NULL,
	"responsibility" integer NOT NULL,
	"explanation_control" integer NOT NULL,
	"action_clarity" integer NOT NULL,
	"relationship_repair" integer NOT NULL,
	"summary" text NOT NULL,
	"key_problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"better_reply" text,
	"lesson" text,
	"ai_fallback_used" boolean DEFAULT false NOT NULL,
	"ai_error_type" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"level_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"final_score" integer,
	"grade" varchar(10),
	"ending_type" varchar(30),
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"character_type" varchar(50) NOT NULL,
	"completed_level_count" integer DEFAULT 0 NOT NULL,
	"average_score" integer DEFAULT 0 NOT NULL,
	"best_score" integer DEFAULT 0 NOT NULL,
	"emotion_recognition_avg" integer DEFAULT 0 NOT NULL,
	"empathy_avg" integer DEFAULT 0 NOT NULL,
	"responsibility_avg" integer DEFAULT 0 NOT NULL,
	"explanation_control_avg" integer DEFAULT 0 NOT NULL,
	"action_clarity_avg" integer DEFAULT 0 NOT NULL,
	"relationship_repair_avg" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dialogue_turns" ADD CONSTRAINT "dialogue_turns_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_results" ADD CONSTRAINT "score_results_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dialogue_turns_session_id_idx" ON "dialogue_turns" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dialogue_turns_session_round_unique" ON "dialogue_turns" USING btree ("session_id","round_number");--> statement-breakpoint
CREATE INDEX "emergency_analyses_user_id_idx" ON "emergency_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "levels_character_type_idx" ON "levels" USING btree ("character_type");--> statement-breakpoint
CREATE UNIQUE INDEX "score_results_session_id_unique" ON "score_results" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "training_sessions_user_id_idx" ON "training_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "training_sessions_level_id_idx" ON "training_sessions" USING btree ("level_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_progress_user_character_unique" ON "user_progress" USING btree ("user_id","character_type");