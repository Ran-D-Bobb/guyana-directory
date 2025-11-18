-- Create function to increment whatsapp_clicks counter on businesses table
CREATE OR REPLACE FUNCTION increment_whatsapp_clicks(business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET whatsapp_clicks = whatsapp_clicks + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment view_count on businesses table
CREATE OR REPLACE FUNCTION increment_view_count(business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET view_count = view_count + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
