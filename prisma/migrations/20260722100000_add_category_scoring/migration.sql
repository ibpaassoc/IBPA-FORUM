-- Every nomination keeps the exact scoring rules that applied when it was
-- created. This prevents later regulation edits from changing an in-flight or
-- completed nomination's scorecard.
ALTER TABLE "NominationApplication"
  ADD COLUMN "scoringSchema" JSONB;

WITH category_context (
  slug,
  category_name,
  source_document,
  practice_focus,
  portfolio_focus,
  standards_focus
) AS (
  VALUES
    ('hair', 'Hair', 'IBPA_Rules_01_Hair1.pdf', 'haircutting and barbering, hair restoration, color technique, and hair extensions', 'cuts, styling, color, restoration, and extension work across relevant hair types and techniques', 'hair and scalp services, chemical processes, tools, and professional hair products'),
    ('nail', 'Nail', 'IBPA_Rules_02_Nail.pdf', 'manicure, nail extension, and podology', 'manicure, extension, and podology results with consistent structure, finish, and client suitability', 'nail and podology services, tool sterilization, skin integrity, and professional products'),
    ('brow', 'Brow', 'IBPA_Rules_03_Brow.pdf', 'brow lamination, styling, shaping, and design', 'brow lamination and styling results across different facial features, hair patterns, and design goals', 'brow services, skin safety, product use, hygiene, and responsible client consultation'),
    ('lash', 'Lash', 'IBPA_Rules_04_Lash.pdf', 'classic, volume, and creative lash extensions, plus lash lifting', 'classic, volume, creative, and lift results showing isolation, direction, symmetry, and finish', 'eye-area services, adhesive and product safety, hygiene, and protection of natural lashes'),
    ('makeup-artistry', 'Makeup Artistry', 'IBPA_Rules_05_Makeup_Artistry.pdf', 'bridal, creative, mature, and daytime makeup artistry', 'bridal, creative, mature, and daytime looks across varied clients, briefs, and lighting conditions', 'makeup services, cosmetic hygiene, brush and product sanitation, skin preparation, and client safety'),
    ('permanent-makeup', 'Permanent Makeup', 'IBPA_Rules_06_Permanent_Makeup.pdf', 'PMU brows, eyeliner, lips, camouflage, and correction', 'healed and fresh PMU results for brows, eyeliner, lips, camouflage, and corrective work', 'invasive PMU procedures, infection control, pigment and device safety, consent, and aftercare'),
    ('education', 'Education', 'IBPA_Rules_07_Education.pdf', 'professional beauty training and online beauty education', 'curricula, teaching demonstrations, student work, outcomes, and evidence from in-person or online programs', 'accurate instruction, student safety, ethical assessment, current curricula, and responsible educational claims'),
    ('salon', 'Salon', 'IBPA_Rules_08_Salon.pdf', 'beauty salon innovation and beauty business development', 'salon operations, service delivery, team development, client experience, innovation, and business results', 'salon-wide hygiene, staff practice, client safety, ethical operations, and responsible business management'),
    ('brand', 'Brand', 'IBPA_Rules_09_Brand.pdf', 'professional beauty product development, beauty brand development, and innovation', 'products, brand systems, market evidence, innovation, and consistent professional presentation', 'product safety, substantiated claims, ethical brand conduct, professional quality controls, and consumer responsibility'),
    ('skin-cosmetology-facial', 'Skin Care, Cosmetology & Facial', 'IBPA_Rules_10_Skin_Care.pdf', 'non-invasive rejuvenation, anti-aging facial treatment, and acne treatment', 'skin-care and facial treatment plans, before-and-after evidence, progress, and outcomes across skin concerns', 'skin assessment, contraindications, sanitation, device and product safety, informed consent, and aftercare'),
    ('body-wellness-nutrition', 'Body, Wellness & Nutrition', 'IBPA_Rules_11_Body_Wellness.pdf', 'body transformation, sculpting massage, nutrition correction, and anti-cellulite treatment', 'body and wellness programs, client progress, treatment or nutrition plans, and documented outcomes', 'body and wellness services, client screening, hygiene, scope of practice, safe techniques, and responsible claims')
), definitions AS (
  SELECT
    c.id AS category_id,
    jsonb_build_object(
      'version', 1,
      'categorySlug', context.slug,
      'categoryName', context.category_name,
      'sourceDocument', context.source_document,
      'maximumTotal', 100,
      'criteria', jsonb_build_array(
        jsonb_build_object('key', 'professionalQualification', 'label', 'Professional qualification', 'description', format('Overall mastery, experience, specialization, and professional competence in %s, including fit with the entered nomination.', context.practice_focus), 'maxScore', 20),
        jsonb_build_object('key', 'professionalAchievements', 'label', 'Professional achievements and recognition', 'description', format('Awards, championships, teaching, judging, publications, speaking, and other recognition relevant to %s.', context.category_name), 'maxScore', 10),
        jsonb_build_object('key', 'portfolioQuality', 'label', 'Portfolio and material quality', 'description', format('Quality, consistency, range of techniques, aesthetics, and professional presentation across %s.', context.portfolio_focus), 'maxScore', 10),
        jsonb_build_object('key', 'professionalDevelopment', 'label', 'Professional activity and development', 'description', format('Continuing education, new technologies, professional events, and sustained development in %s.', context.practice_focus), 'maxScore', 15),
        jsonb_build_object('key', 'industryContribution', 'label', 'Contribution to industry development', 'description', format('Original methods, education, community leadership, industry projects, and demonstrable influence advancing %s.', context.category_name), 'maxScore', 20),
        jsonb_build_object('key', 'professionalStandards', 'label', 'Compliance with professional standards', 'description', format('Sanitation, ethics, professional materials and equipment, safety, and responsibility appropriate to %s.', context.standards_focus), 'maxScore', 10),
        jsonb_build_object('key', 'ibpaLevelAlignment', 'label', 'Alignment with the IBPA Beauty Awards level', 'description', format('Holistic assessment of whether the nominee''s professional journey and evidence meet the international IBPA Beauty Awards standard for %s.', context.category_name), 'maxScore', 15)
      )
    ) AS scoring_schema
  FROM "Category" c
  JOIN category_context context ON context.slug = c.slug
)
UPDATE "NominationApplication" nomination
SET "scoringSchema" = definitions.scoring_schema
FROM definitions
WHERE nomination."categoryId" = definitions.category_id;

-- Guard unexpected legacy categories with the same official seven-criterion,
-- 100-point regulation structure so the new column can safely be required.
UPDATE "NominationApplication" nomination
SET "scoringSchema" = jsonb_build_object(
  'version', 1,
  'categorySlug', category.slug,
  'categoryName', category.name,
  'sourceDocument', 'IBPA Beauty Awards 2026 regulations',
  'maximumTotal', 100,
  'criteria', jsonb_build_array(
    jsonb_build_object('key', 'professionalQualification', 'label', 'Professional qualification', 'description', 'Overall mastery, experience, specialization, professional competence, and fit with the entered nomination.', 'maxScore', 20),
    jsonb_build_object('key', 'professionalAchievements', 'label', 'Professional achievements and recognition', 'description', 'Awards, championships, teaching, judging, publications, speaking, and other professional recognition.', 'maxScore', 10),
    jsonb_build_object('key', 'portfolioQuality', 'label', 'Portfolio and material quality', 'description', 'Quality, consistency, range of techniques, aesthetics, and professional presentation of submitted materials.', 'maxScore', 10),
    jsonb_build_object('key', 'professionalDevelopment', 'label', 'Professional activity and development', 'description', 'Continuing education, new technologies, professional events, and sustained professional development.', 'maxScore', 15),
    jsonb_build_object('key', 'industryContribution', 'label', 'Contribution to industry development', 'description', 'Original methods, education, community leadership, industry projects, and influence on the profession.', 'maxScore', 20),
    jsonb_build_object('key', 'professionalStandards', 'label', 'Compliance with professional standards', 'description', 'Sanitation, ethics, professional materials and equipment, safety, and responsibility.', 'maxScore', 10),
    jsonb_build_object('key', 'ibpaLevelAlignment', 'label', 'Alignment with the IBPA Beauty Awards level', 'description', 'Holistic assessment against the international IBPA Beauty Awards standard.', 'maxScore', 15)
  )
)
FROM "Category" category
WHERE nomination."categoryId" = category.id
  AND nomination."scoringSchema" IS NULL;

ALTER TABLE "NominationApplication"
  ALTER COLUMN "scoringSchema" SET NOT NULL;

-- Five-criterion legacy reviews cannot be compared fairly with the official
-- 100-point scorecard. Preserve the old JSON for audit, then reopen them for
-- scoring under the nomination's snapshotted regulation.
UPDATE "JuryNominationReview" review
SET
  "scoreData" = jsonb_build_object(
    'version', 1,
    'categorySlug', nomination."scoringSchema"->>'categorySlug',
    'scores', '{}'::jsonb,
    'legacyScoreData', review."scoreData"
  ),
  "totalScore" = NULL,
  "status" = 'NOT_STARTED',
  "startedAt" = NULL,
  "completedAt" = NULL
FROM "NominationApplication" nomination
WHERE review."nominationId" = nomination.id
  AND (
    review."scoreData" IS NOT NULL
    OR review."totalScore" IS NOT NULL
    OR review."status" <> 'NOT_STARTED'
  );
