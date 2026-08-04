INSERT INTO "PromoCode" ("id", "key", "keyword", "paymentFlow", "discountPercent", "enabled", "createdAt", "updatedAt")
VALUES ('promo_tickets40', 'TICKETS40', 'TICKETS40', 'TICKETS', 40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "paymentFlow" = EXCLUDED."paymentFlow",
  "discountPercent" = EXCLUDED."discountPercent",
  "updatedAt" = CURRENT_TIMESTAMP;
