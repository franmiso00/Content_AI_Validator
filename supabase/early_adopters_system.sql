-- =============================================================================
-- EARLY ADOPTER SYSTEM - Supabase SQL Schema
-- ContentValidator - Sistema de validación de ideas de contenido
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: early_adopters
-- Almacena información de usuarios que se registran como early adopters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS early_adopters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    
    -- Datos de encuesta (para investigación de mercado)
    role TEXT NOT NULL CHECK (role IN ('creator', 'marketer', 'founder', 'agency', 'other')),
    content_frequency TEXT CHECK (content_frequency IN ('daily', 'weekly', 'monthly', 'occasionally')),
    biggest_challenge TEXT NOT NULL CHECK (biggest_challenge IN ('ideas', 'time', 'conversion', 'consistency')),
    how_did_you_find TEXT CHECK (how_did_you_find IN ('twitter', 'linkedin', 'google', 'friend', 'other')),
    
    -- Posición en la lista de espera
    position INTEGER NOT NULL,
    
    -- Datos de analytics
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Estado de conversión
    is_converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_early_adopters_email ON early_adopters(email);
CREATE INDEX IF NOT EXISTS idx_early_adopters_client_id ON early_adopters(client_id);
CREATE INDEX IF NOT EXISTS idx_early_adopters_position ON early_adopters(position);
CREATE INDEX IF NOT EXISTS idx_early_adopters_role ON early_adopters(role);
CREATE INDEX IF NOT EXISTS idx_early_adopters_challenge ON early_adopters(biggest_challenge);
CREATE INDEX IF NOT EXISTS idx_early_adopters_source ON early_adopters(how_did_you_find);

-- -----------------------------------------------------------------------------
-- Table: anonymous_usage
-- Trackea uso anónimo para rate limiting
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anonymous_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'validation',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries de rate limit
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_client_id ON anonymous_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_created_at ON anonymous_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_client_created ON anonymous_usage(client_id, created_at);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

-- Habilitar RLS
ALTER TABLE early_adopters ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para early_adopters
CREATE POLICY "Allow anonymous insert to early_adopters" 
    ON early_adopters FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select to early_adopters" 
    ON early_adopters FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow service role full access to early_adopters" 
    ON early_adopters FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Políticas para anonymous_usage
CREATE POLICY "Allow anonymous insert to anonymous_usage" 
    ON anonymous_usage FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select to anonymous_usage" 
    ON anonymous_usage FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow service role full access to anonymous_usage" 
    ON anonymous_usage FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Functions & Triggers
-- -----------------------------------------------------------------------------

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para auto-update de updated_at
DROP TRIGGER IF EXISTS update_early_adopters_updated_at ON early_adopters;
CREATE TRIGGER update_early_adopters_updated_at
    BEFORE UPDATE ON early_adopters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Vistas de Analytics
-- -----------------------------------------------------------------------------

-- Vista: Estadísticas por rol
CREATE OR REPLACE VIEW early_adopter_stats_by_role AS
SELECT 
    role,
    COUNT(*) as count,
    ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM early_adopters), 0) * 100, 1) as percentage
FROM early_adopters
GROUP BY role
ORDER BY count DESC;

-- Vista: Estadísticas por reto principal
CREATE OR REPLACE VIEW early_adopter_stats_by_challenge AS
SELECT 
    biggest_challenge,
    COUNT(*) as count,
    ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM early_adopters), 0) * 100, 1) as percentage
FROM early_adopters
GROUP BY biggest_challenge
ORDER BY count DESC;

-- Vista: Estadísticas por fuente de adquisición
CREATE OR REPLACE VIEW early_adopter_stats_by_source AS
SELECT 
    COALESCE(how_did_you_find, 'unknown') as source,
    COUNT(*) as count,
    ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM early_adopters), 0) * 100, 1) as percentage
FROM early_adopters
GROUP BY how_did_you_find
ORDER BY count DESC;

-- Vista: Registros diarios con acumulado
CREATE OR REPLACE VIEW early_adopter_daily_signups AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as signups,
    SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_total
FROM early_adopters
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Vista: Estadísticas de uso por cliente
CREATE OR REPLACE VIEW anonymous_usage_stats AS
SELECT 
    client_id,
    COUNT(*) as total_validations,
    MIN(created_at) as first_validation,
    MAX(created_at) as last_validation,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as validations_last_30_days
FROM anonymous_usage
GROUP BY client_id
ORDER BY total_validations DESC;
