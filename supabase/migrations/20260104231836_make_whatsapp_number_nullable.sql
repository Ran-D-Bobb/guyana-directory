-- Make whatsapp_number nullable across all tables (WhatsApp functionality removed from UI)

ALTER TABLE businesses ALTER COLUMN whatsapp_number DROP NOT NULL;
ALTER TABLE rentals ALTER COLUMN whatsapp_number DROP NOT NULL;
ALTER TABLE tourism_experiences ALTER COLUMN whatsapp_number DROP NOT NULL;
