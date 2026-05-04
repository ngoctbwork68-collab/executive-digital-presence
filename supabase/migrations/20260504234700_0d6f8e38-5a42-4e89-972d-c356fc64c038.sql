DROP POLICY IF EXISTS "Public can view safe settings only" ON public.settings;

CREATE POLICY "Public can view safe settings only"
ON public.settings
FOR SELECT
USING (
  key = ANY (ARRAY[
    'logo_url','favicon_url','site_name','footer_tagline','footer_text',
    'header_style','footer_style',
    'page_about','page_projects','page_blog','page_contact','page_store','page_heroes',
    'show_testimonials','show_hero_buttons',
    'color_theme','custom_theme_colors','font_theme',
    'bank_name','bank_code','bank_account','bank_owner',
    'home_sections_order','home_sections_visibility'
  ])
);