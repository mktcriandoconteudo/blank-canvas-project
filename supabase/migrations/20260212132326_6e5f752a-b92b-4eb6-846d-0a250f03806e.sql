-- Table for custom selector options (amenities, condo features, important info)
CREATE TABLE public.selector_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL, -- 'amenity', 'condo_feature', 'important_info'
  key text NOT NULL,
  label text NOT NULL,
  icon_name text NOT NULL DEFAULT 'circle',
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Unique key per category
CREATE UNIQUE INDEX idx_selector_options_category_key ON public.selector_options(category, key);

-- Enable RLS
ALTER TABLE public.selector_options ENABLE ROW LEVEL SECURITY;

-- Anyone can read options
CREATE POLICY "Anyone can view selector options"
ON public.selector_options FOR SELECT
USING (true);

-- Admins can manage options
CREATE POLICY "Admins can manage selector options"
ON public.selector_options FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Pre-populate with existing amenity options
INSERT INTO public.selector_options (category, key, label, icon_name, display_order) VALUES
('amenity', 'quartos', 'Quartos', 'bed', 1),
('amenity', 'smart-tv', 'Smart TV', 'tv', 2),
('amenity', 'wifi', 'Wi-Fi', 'wifi', 3),
('amenity', 'hospedes', 'Hóspedes', 'users', 4),
('amenity', 'piscina', 'Piscina aquecida', 'waves', 5),
('amenity', 'piscina-normal', 'Piscina', 'waves', 6),
('amenity', 'ar-condicionado', 'Ar-condicionado', 'snowflake', 7),
('amenity', 'varanda', 'Varanda', 'fence', 8),
('amenity', 'geladeira', 'Geladeira', 'refrigerator', 9),
('amenity', 'microondas', 'Microondas', 'microwave', 10),
('amenity', 'academia', 'Academia', 'dumbbell', 11),
('amenity', 'elevador', 'Elevador', 'arrow-up-down', 12),
('amenity', 'estacionamento', 'Estacionamento', 'car', 13),
('amenity', 'cozinha', 'Cozinha', 'utensils-crossed', 14),
('amenity', 'cafe', 'Café da manhã', 'coffee', 15),
('amenity', 'banheira', 'Banheira', 'bath', 16),
('amenity', 'vista-montanha', 'Vista montanha', 'mountain', 17),
('amenity', 'jardim', 'Jardim', 'tree-pine', 18),
('amenity', 'alarme-co', 'Alarme CO₂', 'shield-alert', 19),
('amenity', 'detector-fumaca', 'Detector fumaça', 'flame', 20),
('amenity', 'condominio', 'Condomínio', 'home', 21),

-- Condo features
('condo_feature', 'wifi', 'Wi-Fi', 'wifi', 1),
('condo_feature', 'piscina-compartilhada', 'Piscina aquecida compartilhada', 'waves', 2),
('condo_feature', 'piscina-normal', 'Piscina', 'waves', 3),
('condo_feature', 'elevador', 'Elevador', 'arrow-up-down', 4),
('condo_feature', 'ar-condicionado-split', 'Ar-condicionado split', 'snowflake', 5),
('condo_feature', 'varanda-privativa', 'Varanda privativa', 'fence', 6),
('condo_feature', 'geladeira', 'Geladeira 220V', 'refrigerator', 7),
('condo_feature', 'microondas', 'Micro-ondas 220V', 'microwave', 8),
('condo_feature', 'academia-compartilhada', 'Academia compartilhada', 'dumbbell', 9),
('condo_feature', 'alarme-co', 'Alarme de monóxido de carbono', 'shield-alert', 10),
('condo_feature', 'detector-fumaca', 'Detector de fumaça', 'flame', 11),
('condo_feature', 'estacionamento', 'Estacionamento', 'car', 12),
('condo_feature', 'cozinha-equipada', 'Cozinha completa', 'utensils-crossed', 13),
('condo_feature', 'cafe-manha', 'Café da manhã', 'coffee', 14),
('condo_feature', 'banheira', 'Banheira', 'bath', 15),
('condo_feature', 'vista-montanha', 'Vista montanha', 'mountain', 16),
('condo_feature', 'jardim', 'Jardim', 'tree-pine', 17),
('condo_feature', 'smart-tv', 'Smart TV', 'tv', 18),
('condo_feature', 'portaria-24h', 'Portaria 24h', 'lock', 19),
('condo_feature', 'area-kids', 'Área kids', 'baby', 20),
('condo_feature', 'pet-friendly', 'Pet friendly', 'dog', 21),
('condo_feature', 'sauna', 'Sauna', 'sparkles', 22),
('condo_feature', 'lavanderia', 'Lavanderia', 'shirt', 23),
('condo_feature', 'cama-casal', 'Cama casal', 'bed-double', 24),
('condo_feature', 'cortina-blackout', 'Cortina blackout', 'blinds', 25),
('condo_feature', 'guarda-roupa', 'Guarda-roupa planejado', 'door-open', 26),
('condo_feature', 'armario-trancado', 'Armário com chave', 'lock', 27),
('condo_feature', 'chuveiro-box', 'Chuveiro com box', 'shower-head', 28),
('condo_feature', 'ducha-higienica', 'Ducha higiênica', 'shower-head', 29),
('condo_feature', 'fogao-4-bocas', 'Fogão 4 bocas c/ forno', 'cooking-pot', 30),
('condo_feature', 'adega', 'Adega', 'wine', 31),
('condo_feature', 'bebedouro', 'Bebedouro 220V', 'glass-water', 32),
('condo_feature', 'sofa-cama', 'Sofá cama casal', 'sofa', 33),
('condo_feature', 'poltronas', 'Poltronas', 'armchair', 34),
('condo_feature', 'colchao-solteiro', 'Colchão solteiro extra', 'grip', 35),
('condo_feature', 'sacada-blindex', 'Sacada com blindex', 'lamp', 36),
('condo_feature', 'rede', 'Ganchos para rede', 'fence', 37),
('condo_feature', 'varal', 'Varal fixo', 'shirt', 38),
('condo_feature', 'quadros-decorativos', 'Quadros decorativos', 'frame', 39),

-- Important info
('important_info', 'nao-aceita-pet', 'NÃO aceita pet', 'paw-print', 1),
('important_info', 'trazer-roupa-cama-banho', 'Trazer roupa de cama e banho', 'bed-double', 2),
('important_info', 'trazer-kit-higiene', 'Trazer kit higiene pessoal', 'sparkles', 3),
('important_info', 'trazer-kit-limpeza', 'Trazer kit limpeza', 'droplets', 4),
('important_info', 'nao-deixar-vasilhas-sujas', 'NÃO deixar vasilhas sujas', 'ban', 5),
('important_info', 'sujeito-multa-limpeza', 'Sujeito a multa por limpeza', 'credit-card', 6),
('important_info', 'boleto-multa-diaria', 'Multa: valor de 1 diária no CPF', 'clipboard-list', 7),
('important_info', 'evitar-sobrecarga', 'Evitar sobrecarga elétrica', 'zap', 8),
('important_info', 'nao-ligar-tudo-junto', 'NÃO ligar 2 ACs + chuveiro juntos', 'alert-triangle', 9),
('important_info', 'energia-220v', 'Energia 220V', 'plug', 10),
('important_info', 'proibido-fumar', 'Proibido fumar', 'cigarette', 11),
('important_info', 'silencio-22h', 'Silêncio após 22h', 'volume-2', 12),
('important_info', 'checkin-14h', 'Check-in a partir das 14h', 'clock', 13),
('important_info', 'checkout-11h', 'Check-out até 11h', 'clock', 14),
('important_info', 'chave-portaria', 'Chave na portaria', 'key-round', 15),
('important_info', 'nao-criancas-sem-supervisao', 'Crianças sob supervisão', 'baby', 16),
('important_info', 'cuidado-aquecimento', 'Cuidado com aquecimento', 'thermometer', 17),
('important_info', 'proibido-festas', 'Proibido festas', 'ban', 18),
('important_info', 'detector-fumaca-ativo', 'Detector de fumaça ativo', 'flame', 19);