-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "account_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "otp_code_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "latitude" REAL,
    "longitude" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fields_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_local" TEXT,
    "category" TEXT NOT NULL,
    "icon_key" TEXT NOT NULL DEFAULT 'crop',
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "soil_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_local" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "agro_climatic_regions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_local" TEXT,
    "states_covered" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "growth_stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crop_id" TEXT,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "growth_stages_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crop_cycles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "crop_id" TEXT NOT NULL,
    "soil_type_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crop_cycles_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "crop_cycles_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "crop_cycles_soil_type_id_fkey" FOREIGN KEY ("soil_type_id") REFERENCES "soil_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "crop_cycles_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "agro_climatic_regions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suitability_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crop_cycle_id" TEXT NOT NULL,
    "is_suitable" BOOLEAN NOT NULL,
    "confidence" REAL NOT NULL,
    "reasoning" TEXT NOT NULL,
    "alternatives_json" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suitability_checks_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "irrigation_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crop_cycle_id" TEXT NOT NULL,
    "growth_stage_id" TEXT NOT NULL,
    "soil_moisture_pct" REAL NOT NULL,
    "temperature_c" REAL NOT NULL,
    "humidity_pct" REAL NOT NULL,
    "forecast_json" JSONB,
    "plot_area_sq_m" REAL NOT NULL,
    "recommended_amount_mm" REAL NOT NULL,
    "recommended_volume_liters" REAL NOT NULL,
    "irrigation_required" BOOLEAN NOT NULL,
    "urgency" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "weather_auto_fetched" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "irrigation_recommendations_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "irrigation_recommendations_growth_stage_id_fkey" FOREIGN KEY ("growth_stage_id") REFERENCES "growth_stages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disease_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crop_cycle_id" TEXT NOT NULL,
    "image_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "image_relevant" BOOLEAN,
    "crop_match" BOOLEAN,
    "image_quality_sufficient" BOOLEAN,
    "is_healthy" BOOLEAN,
    "disease_common_name" TEXT,
    "disease_scientific_name" TEXT,
    "risk_level" TEXT,
    "treatment_json" JSONB,
    "consequences_if_untreated" TEXT,
    "precautions_json" JSONB,
    "probable_cause" TEXT,
    "confidence" REAL,
    "visible_symptoms_json" JSONB,
    "message" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "disease_scans_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "related_type" TEXT NOT NULL,
    "related_id" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "llm_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "user_id" TEXT,
    "input_payload" JSONB NOT NULL,
    "output_payload" JSONB,
    "confidence" REAL,
    "latency_ms" INTEGER NOT NULL,
    "validation_status" TEXT NOT NULL,
    "flagged_for_review" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "knowledge_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "crop_id" TEXT,
    "disease_key" TEXT,
    "disease_common_name" TEXT,
    "disease_scientific_name" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_url" TEXT,
    "soil_type_name" TEXT,
    "region_name" TEXT,
    "medicine_name" TEXT,
    "dosage" TEXT,
    "application_method" TEXT,
    "timing_frequency" TEXT,
    "precautions_json" JSONB,
    "consequences_if_untreated" TEXT,
    "probable_cause" TEXT,
    "typical_depth_mm" REAL,
    "moisture_note" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "knowledge_items_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otp_verifications_user_id_idx" ON "otp_verifications"("user_id");

-- CreateIndex
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "fields_user_id_idx" ON "fields"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "crops_name_key" ON "crops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "soil_types_name_key" ON "soil_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agro_climatic_regions_name_key" ON "agro_climatic_regions"("name");

-- CreateIndex
CREATE INDEX "growth_stages_crop_id_idx" ON "growth_stages"("crop_id");

-- CreateIndex
CREATE INDEX "crop_cycles_field_id_idx" ON "crop_cycles"("field_id");

-- CreateIndex
CREATE INDEX "crop_cycles_crop_id_idx" ON "crop_cycles"("crop_id");

-- CreateIndex
CREATE INDEX "suitability_checks_crop_cycle_id_idx" ON "suitability_checks"("crop_cycle_id");

-- CreateIndex
CREATE INDEX "irrigation_recommendations_crop_cycle_id_idx" ON "irrigation_recommendations"("crop_cycle_id");

-- CreateIndex
CREATE INDEX "disease_scans_crop_cycle_id_idx" ON "disease_scans"("crop_cycle_id");

-- CreateIndex
CREATE INDEX "feedback_user_id_idx" ON "feedback"("user_id");

-- CreateIndex
CREATE INDEX "feedback_related_type_related_id_idx" ON "feedback"("related_type", "related_id");

-- CreateIndex
CREATE INDEX "llm_logs_endpoint_idx" ON "llm_logs"("endpoint");

-- CreateIndex
CREATE INDEX "llm_logs_flagged_for_review_idx" ON "llm_logs"("flagged_for_review");

-- CreateIndex
CREATE INDEX "knowledge_items_category_idx" ON "knowledge_items"("category");

-- CreateIndex
CREATE INDEX "knowledge_items_disease_key_idx" ON "knowledge_items"("disease_key");

-- CreateIndex
CREATE INDEX "knowledge_items_crop_id_idx" ON "knowledge_items"("crop_id");

