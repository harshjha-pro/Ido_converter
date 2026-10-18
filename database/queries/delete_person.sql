-- delete_person.sql — honour a deletion request. Replace the value, then run both statements.
-- Normalise first: emails in lower case; Indian mobiles as +91XXXXXXXXXX.
SET @contact = 'person@example.com';
SELECT id, contact_type, contact_value, created_at FROM early_access_leads WHERE contact_value = @contact;
DELETE FROM early_access_leads WHERE contact_value = @contact;
