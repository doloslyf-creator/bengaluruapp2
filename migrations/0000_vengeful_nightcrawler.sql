CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"category" varchar NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"featured_image" text,
	"images" json DEFAULT '[]'::json NOT NULL,
	"author" text NOT NULL,
	"reading_time" integer DEFAULT 5,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"property_id" varchar,
	"property_name" text NOT NULL,
	"booking_type" varchar NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"preferred_date" text,
	"preferred_time" text,
	"visit_type" varchar,
	"number_of_visitors" text,
	"consultation_type" varchar,
	"preferred_contact_time" text,
	"urgency" varchar,
	"questions" text,
	"special_requests" text,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "civil_mep_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"report_type" varchar DEFAULT 'combined' NOT NULL,
	"report_version" text DEFAULT '1.0',
	"generated_by" text,
	"report_date" timestamp DEFAULT now(),
	"structural_analysis" json,
	"material_breakdown" json,
	"cost_breakdown" json,
	"quality_assessment" json,
	"mep_systems" json,
	"compliance_checklist" json,
	"snag_report" json,
	"executive_summary" text,
	"overall_score" numeric(3, 1) DEFAULT '0.0',
	"investment_recommendation" varchar,
	"estimated_maintenance_cost" numeric(10, 2),
	"report_pdf_url" text,
	"supporting_documents" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_by" text DEFAULT 'admin',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"activity_type" varchar NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"outcome" varchar,
	"next_action" text,
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"performed_by" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"note" text NOT NULL,
	"note_type" varchar DEFAULT 'general',
	"is_private" boolean DEFAULT false,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"source" varchar NOT NULL,
	"lead_type" varchar DEFAULT 'warm' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"property_id" varchar,
	"property_name" text NOT NULL,
	"interested_configuration" text,
	"budget_range" text,
	"lead_details" json DEFAULT '{}'::json NOT NULL,
	"lead_score" integer DEFAULT 0,
	"qualification_notes" text,
	"status" varchar DEFAULT 'new' NOT NULL,
	"assigned_to" text,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"communication_preference" varchar DEFAULT 'phone',
	"expected_close_date" timestamp,
	"deal_value" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leads_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" varchar NOT NULL,
	"developer" text NOT NULL,
	"status" varchar NOT NULL,
	"area" text NOT NULL,
	"zone" varchar NOT NULL,
	"address" text NOT NULL,
	"possession_date" text,
	"rera_number" text,
	"rera_approved" boolean DEFAULT false,
	"infrastructure_verdict" text,
	"zoning_info" text,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"images" json DEFAULT '[]'::json NOT NULL,
	"videos" json DEFAULT '[]'::json NOT NULL,
	"youtube_video_url" text,
	"location_score" integer DEFAULT 0,
	"amenities_score" integer DEFAULT 0,
	"value_score" integer DEFAULT 0,
	"overall_score" numeric(3, 1) DEFAULT '0.0',
	"area_avg_price_min" integer,
	"area_avg_price_max" integer,
	"city_avg_price_min" integer,
	"city_avg_price_max" integer,
	"price_comparison" text,
	"title_clearance_status" text,
	"ownership_type" text,
	"legal_opinion_provided_by" text,
	"title_flow_summary" text,
	"encumbrance_status" text,
	"ec_extract_link" text,
	"mutation_status" text,
	"conversion_certificate" boolean DEFAULT false,
	"rera_registered" boolean DEFAULT false,
	"rera_id" text,
	"rera_link" text,
	"litigation_status" text,
	"approving_authorities" json DEFAULT '[]'::json,
	"layout_sanction_copy_link" text,
	"legal_comments" text,
	"legal_verdict_badge" text,
	"has_civil_mep_report" boolean DEFAULT false,
	"civil_mep_report_price" numeric(10, 2) DEFAULT '2999.00',
	"civil_mep_report_status" varchar DEFAULT 'draft',
	"has_valuation_report" boolean DEFAULT false,
	"valuation_report_price" numeric(10, 2) DEFAULT '15000.00',
	"valuation_report_status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_configurations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"configuration" text NOT NULL,
	"price_per_sqft" numeric(10, 2) NOT NULL,
	"built_up_area" integer NOT NULL,
	"plot_size" integer,
	"availability_status" varchar NOT NULL,
	"total_units" integer,
	"available_units" integer,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_valuation_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"report_version" text DEFAULT '1.0',
	"generated_by" text,
	"report_date" timestamp DEFAULT now(),
	"market_analysis" json,
	"property_assessment" json,
	"cost_breakdown" json,
	"financial_analysis" json,
	"investment_recommendation" varchar,
	"risk_assessment" json,
	"executive_summary" text,
	"overall_score" numeric(3, 1) DEFAULT '0.0',
	"key_highlights" json DEFAULT '[]'::json,
	"report_pdf_url" text,
	"supporting_documents" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar,
	"report_type" varchar DEFAULT 'civil-mep' NOT NULL,
	"property_id" varchar NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR',
	"payment_method" varchar NOT NULL,
	"payment_status" varchar DEFAULT 'pending',
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"pay_later_due_date" timestamp,
	"pay_later_reminders_sent" integer DEFAULT 0,
	"access_granted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civil_mep_reports" ADD CONSTRAINT "civil_mep_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_configurations" ADD CONSTRAINT "property_configurations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_valuation_reports" ADD CONSTRAINT "property_valuation_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_payments" ADD CONSTRAINT "report_payments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;