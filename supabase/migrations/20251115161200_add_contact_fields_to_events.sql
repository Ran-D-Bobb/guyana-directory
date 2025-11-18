-- Add contact fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS email TEXT;

-- Add comment
COMMENT ON COLUMN events.whatsapp_number IS 'WhatsApp number for contacting event organizer';
COMMENT ON COLUMN events.email IS 'Email for contacting event organizer';
