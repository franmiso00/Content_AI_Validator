# INSTRUCCIONES TÉCNICAS: Sistema de Early Adopters para ContentValidator

## CONTEXTO DEL PROYECTO

**Producto**: ContentValidator - Herramienta de validación de ideas de contenido usando datos de comunidades reales (Reddit, etc.)

**Stack técnico actual**:
- Frontend: Next.js 14+ (App Router), React, TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Backend: Supabase (Auth, Database, RLS)
- API externa: Perplexity API para análisis
- Hosting: Vercel

**Objetivo de esta implementación**: Crear un sistema de limitación de uso + registro de early adopters para validar la idea del producto antes de construir un sistema de usuarios completo.

---

## ARQUITECTURA DEL SISTEMA

### Diagrama de flujo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE USUARIO                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Usuario visita landing page                                             │
│           ↓                                                                  │
│  2. Se genera fingerprint del navegador (client-side)                       │
│           ↓                                                                  │
│  3. Se verifica uso en Supabase via API route                               │
│           ↓                                                                  │
│  4. Usuario tiene 3 validaciones gratuitas                                  │
│           ↓                                                                  │
│  5. Al agotar → Modal de Early Adopter aparece                              │
│           ↓                                                                  │
│  6. Usuario completa formulario de 2 pasos                                  │
│           ↓                                                                  │
│  7. Se registra en tabla early_adopters                                     │
│           ↓                                                                  │
│  8. Usuario recibe +5 validaciones bonus                                    │
│           ↓                                                                  │
│  9. Puede continuar usando la herramienta                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sistema de identificación (sin cookies)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FINGERPRINTING STRATEGY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMPONENTES DEL FINGERPRINT:                                               │
│  ├── Canvas fingerprint (dibujo único por GPU/driver)                       │
│  ├── WebGL renderer info (modelo de GPU)                                    │
│  ├── Screen resolution + color depth                                        │
│  ├── Timezone                                                               │
│  ├── Navigator language(s)                                                  │
│  ├── Platform                                                               │
│  ├── Hardware concurrency (núcleos CPU)                                     │
│  ├── Device memory                                                          │
│  └── Touch points                                                           │
│           ↓                                                                  │
│  Se concatenan y se genera SHA-256 hash (16 chars)                          │
│           ↓                                                                  │
│  Se almacena en localStorage para persistencia                              │
│           ↓                                                                  │
│  Fallback: IP del usuario (server-side) si fingerprint falla                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estructura de archivos a crear

```
src/
├── hooks/
│   ├── use-client-fingerprint.ts      # Hook para generar/obtener fingerprint
│   └── use-validation-limit.ts        # Hook para gestionar límite de validaciones
│
├── components/
│   └── early-adopter/
│       ├── EarlyAdopterModal.tsx      # Modal con formulario de 2 pasos
│       └── ValidationCounter.tsx      # Componente visual del contador
│
├── app/
│   ├── page.tsx                       # Página principal (modificar existente)
│   └── api/
│       ├── rate-limit/
│       │   ├── check/
│       │   │   └── route.ts           # Endpoint para verificar uso actual
│       │   └── record/
│       │       └── route.ts           # Endpoint para registrar una validación
│       └── early-adopters/
│           └── route.ts               # Endpoint CRUD para early adopters
│
└── components/
    └── landing/
        └── Hero.tsx                   # Componente Hero (modificar existente)
```

---

## PASO 1: CONFIGURACIÓN DE BASE DE DATOS (SUPABASE)

### Instrucción para el agente

Ejecuta el siguiente SQL en el SQL Editor de Supabase. Este script crea todas las tablas, índices, políticas RLS y vistas de analytics necesarias.

### SQL completo a ejecutar

```sql
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
```

### Verificación

Después de ejecutar el SQL, verifica que las tablas existen:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('early_adopters', 'anonymous_usage');
```

---

## PASO 2: CREAR HOOKS DE REACT

### Archivo: `src/hooks/use-client-fingerprint.ts`

Este hook genera un fingerprint único del navegador para identificar usuarios sin cookies.

```typescript
// src/hooks/use-client-fingerprint.ts
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cv_client_id";

/**
 * Generates a semi-persistent client fingerprint without cookies.
 * Uses a combination of browser characteristics + localStorage.
 * This is for rate limiting, not tracking users across sites.
 */
export function useClientFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateFingerprint = async () => {
      // Check localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFingerprint(stored);
        setIsLoading(false);
        return;
      }

      // Generate new fingerprint
      const fp = await createFingerprint();
      localStorage.setItem(STORAGE_KEY, fp);
      setFingerprint(fp);
      setIsLoading(false);
    };

    generateFingerprint();
  }, []);

  return { fingerprint, isLoading };
}

async function createFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. Canvas fingerprint (most reliable)
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("ContentValidator", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("ContentValidator", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push("canvas-error");
  }

  // 2. WebGL renderer
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "");
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "");
      }
    }
  } catch {
    components.push("webgl-error");
  }

  // 3. Screen properties
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  components.push(String(screen.pixelDepth));

  // 4. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 5. Language
  components.push(navigator.language);
  components.push(navigator.languages?.join(",") || "");

  // 6. Platform
  components.push(navigator.platform);

  // 7. Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0));

  // 8. Device memory (if available)
  // @ts-ignore - deviceMemory is not in all browsers
  components.push(String(navigator.deviceMemory || 0));

  // 9. Touch support
  components.push(String(navigator.maxTouchPoints || 0));

  // Generate hash
  const hash = await hashString(components.join("|"));
  
  // Add timestamp component for uniqueness
  const timestamp = Date.now().toString(36);
  
  return `${hash}-${timestamp}`;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Utility to get the fingerprint synchronously if already stored
 */
export function getStoredFingerprint(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Mark that this client is an early adopter (increases limit)
 */
export function markAsEarlyAdopter() {
  if (typeof window === "undefined") return;
  localStorage.setItem("cv_early_adopter", "true");
}

/**
 * Check if client is early adopter
 */
export function isEarlyAdopter(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cv_early_adopter") === "true";
}
```

### Archivo: `src/hooks/use-validation-limit.ts`

Este hook gestiona el estado de las validaciones restantes y la lógica de bonificación.

```typescript
// src/hooks/use-validation-limit.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useClientFingerprint, isEarlyAdopter, markAsEarlyAdopter } from "./use-client-fingerprint";

const FREE_LIMIT = 3;
const EARLY_ADOPTER_BONUS = 5;

interface ValidationLimitState {
  remaining: number;
  total: number;
  isLimited: boolean;
  isLoading: boolean;
  isEarlyAdopter: boolean;
}

export function useValidationLimit() {
  const { fingerprint, isLoading: fingerprintLoading } = useClientFingerprint();
  const [state, setState] = useState<ValidationLimitState>({
    remaining: FREE_LIMIT,
    total: FREE_LIMIT,
    isLimited: false,
    isLoading: true,
    isEarlyAdopter: false,
  });

  // Fetch current usage on mount
  useEffect(() => {
    if (!fingerprint || fingerprintLoading) return;

    const fetchUsage = async () => {
      try {
        const earlyAdopter = isEarlyAdopter();
        const response = await fetch("/api/rate-limit/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: fingerprint }),
        });

        if (response.ok) {
          const data = await response.json();
          const total = earlyAdopter ? FREE_LIMIT + EARLY_ADOPTER_BONUS : FREE_LIMIT;
          const remaining = Math.max(0, total - data.used);
          
          setState({
            remaining,
            total,
            isLimited: remaining <= 0,
            isLoading: false,
            isEarlyAdopter: earlyAdopter,
          });
        }
      } catch (error) {
        console.error("Failed to check rate limit:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUsage();
  }, [fingerprint, fingerprintLoading]);

  // Decrement usage after a validation
  const recordUsage = useCallback(async () => {
    if (!fingerprint) return;

    try {
      const response = await fetch("/api/rate-limit/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: fingerprint }),
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          remaining: Math.max(0, prev.remaining - 1),
          isLimited: prev.remaining - 1 <= 0,
        }));
      }
    } catch (error) {
      console.error("Failed to record usage:", error);
    }
  }, [fingerprint]);

  // Grant early adopter bonus
  const grantEarlyAdopterBonus = useCallback(async () => {
    markAsEarlyAdopter();
    
    setState(prev => ({
      ...prev,
      remaining: prev.remaining + EARLY_ADOPTER_BONUS,
      total: prev.total + EARLY_ADOPTER_BONUS,
      isLimited: false,
      isEarlyAdopter: true,
    }));
  }, []);

  return {
    ...state,
    fingerprint,
    recordUsage,
    grantEarlyAdopterBonus,
  };
}
```

---

## PASO 3: CREAR API ROUTES

### Archivo: `src/app/api/rate-limit/check/route.ts`

Endpoint para verificar el uso actual de un cliente.

```typescript
// src/app/api/rate-limit/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      // Fallback to IP-based identification
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                 request.headers.get("x-real-ip") || 
                 "unknown";
      
      return NextResponse.json({ 
        used: await getUsageCount(`ip:${ip}`),
        clientId: `ip:${ip}`
      });
    }

    const used = await getUsageCount(clientId);
    
    return NextResponse.json({ used, clientId });
  } catch (error) {
    console.error("Rate limit check error:", error);
    return NextResponse.json({ used: 0 }, { status: 200 });
  }
}

async function getUsageCount(clientId: string): Promise<number> {
  const supabase = await createClient();
  
  // Get usage from last 30 days (or adjust as needed)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count, error } = await supabase
    .from("anonymous_usage")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) {
    console.error("Error fetching usage:", error);
    return 0;
  }

  return count || 0;
}
```

### Archivo: `src/app/api/rate-limit/record/route.ts`

Endpoint para registrar el uso de una validación.

```typescript
// src/app/api/rate-limit/record/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_LIMIT = 3;
const EARLY_ADOPTER_LIMIT = 8; // 3 + 5 bonus

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();
    const supabase = await createClient();

    // Determine effective client ID
    const effectiveClientId = clientId || 
      `ip:${request.headers.get("x-forwarded-for")?.split(",")[0] || 
            request.headers.get("x-real-ip") || 
            "unknown"}`;

    // Check if this client is an early adopter
    const { data: earlyAdopterData } = await supabase
      .from("early_adopters")
      .select("id")
      .eq("client_id", effectiveClientId)
      .single();

    const limit = earlyAdopterData ? EARLY_ADOPTER_LIMIT : FREE_LIMIT;

    // Get current usage count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count } = await supabase
      .from("anonymous_usage")
      .select("*", { count: "exact", head: true })
      .eq("client_id", effectiveClientId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const currentCount = count || 0;

    // Check if limit exceeded
    if (currentCount >= limit) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          used: currentCount,
          limit,
          isEarlyAdopter: !!earlyAdopterData
        },
        { status: 429 }
      );
    }

    // Record the usage
    const { error } = await supabase
      .from("anonymous_usage")
      .insert({
        client_id: effectiveClientId,
        action: "validation",
        metadata: {
          userAgent: request.headers.get("user-agent"),
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Error recording usage:", error);
      return NextResponse.json({ error: "Failed to record usage" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      used: currentCount + 1,
      remaining: limit - (currentCount + 1),
      limit
    });

  } catch (error) {
    console.error("Rate limit record error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Archivo: `src/app/api/early-adopters/route.ts`

Endpoint para gestionar el registro de early adopters.

```typescript
// src/app/api/early-adopters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface EarlyAdopterPayload {
  email: string;
  clientId: string;
  role: string;
  contentFrequency?: string;
  biggestChallenge: string;
  howDidYouFind?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: EarlyAdopterPayload = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!payload.email || !payload.clientId || !payload.role || !payload.biggestChallenge) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingByEmail } = await supabase
      .from("early_adopters")
      .select("id, position")
      .eq("email", payload.email)
      .single();

    if (existingByEmail) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        position: existingByEmail.position,
        message: "Ya estás en la lista de early adopters"
      });
    }

    // Check if clientId already exists (same device, different email)
    const { data: existingByClient } = await supabase
      .from("early_adopters")
      .select("id, email")
      .eq("client_id", payload.clientId)
      .single();

    if (existingByClient) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "Este dispositivo ya está registrado como early adopter"
      });
    }

    // Get current count for position
    const { count } = await supabase
      .from("early_adopters")
      .select("*", { count: "exact", head: true });

    const position = (count || 0) + 1;

    // Get IP for analytics
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               null;

    // Insert new early adopter
    const { data, error } = await supabase
      .from("early_adopters")
      .insert({
        email: payload.email.toLowerCase().trim(),
        client_id: payload.clientId,
        role: payload.role,
        content_frequency: payload.contentFrequency || null,
        biggest_challenge: payload.biggestChallenge,
        how_did_you_find: payload.howDidYouFind || null,
        position,
        ip_address: ip,
        user_agent: request.headers.get("user-agent"),
        metadata: {
          source: "landing_page",
          version: "1.0"
        }
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting early adopter:", error);
      
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          message: "Ya estás registrado"
        });
      }
      
      return NextResponse.json(
        { error: "Failed to register" },
        { status: 500 }
      );
    }

    // Return success with position
    return NextResponse.json({
      success: true,
      position,
      totalEarlyAdopters: position,
      bonusValidations: 5,
      message: "¡Bienvenido a la lista de early adopters!"
    });

  } catch (error) {
    console.error("Early adopter registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const clientId = searchParams.get("clientId");

    if (!email && !clientId) {
      return NextResponse.json(
        { error: "Email or clientId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from("early_adopters")
      .select("position, created_at");

    if (email) {
      query = query.eq("email", email.toLowerCase().trim());
    } else if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ isEarlyAdopter: false });
    }

    // Get total count
    const { count } = await supabase
      .from("early_adopters")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      isEarlyAdopter: true,
      position: data.position,
      totalEarlyAdopters: count || 0,
      joinedAt: data.created_at
    });

  } catch (error) {
    console.error("Early adopter check error:", error);
    return NextResponse.json({ isEarlyAdopter: false });
  }
}
```

---

## PASO 4: CREAR COMPONENTES UI

### Archivo: `src/components/early-adopter/EarlyAdopterModal.tsx`

Modal con formulario de 2 pasos para capturar información de early adopters.

```typescript
// src/components/early-adopter/EarlyAdopterModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

interface EarlyAdopterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  maxFreeValidations: number;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  role: string;
  contentFrequency: string;
  biggestChallenge: string;
  howDidYouFind: string;
}

const roles = [
  { id: "creator", label: "Creador de contenido", icon: "✍️" },
  { id: "marketer", label: "Marketing / Growth", icon: "📈" },
  { id: "founder", label: "Founder / CEO", icon: "🚀" },
  { id: "agency", label: "Agencia", icon: "🏢" },
  { id: "other", label: "Otro", icon: "💼" },
];

const frequencies = [
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "occasionally", label: "Ocasional" },
];

const challenges = [
  { id: "ideas", label: "Encontrar ideas que funcionen" },
  { id: "time", label: "No tengo tiempo para investigar" },
  { id: "conversion", label: "Mi contenido no convierte" },
  { id: "consistency", label: "Mantener consistencia" },
];

const sources = [
  { id: "twitter", label: "Twitter/X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "google", label: "Google" },
  { id: "friend", label: "Recomendación" },
  { id: "other", label: "Otro" },
];

export function EarlyAdopterModal({
  open,
  onOpenChange,
  clientId,
  maxFreeValidations,
  onSuccess,
}: EarlyAdopterModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [totalAdopters, setTotalAdopters] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    role: "",
    contentFrequency: "",
    biggestChallenge: "",
    howDidYouFind: "",
  });

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Error de identificación. Por favor, recarga la página.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/early-adopters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarte");
      }

      setPosition(data.position);
      setTotalAdopters(data.totalEarlyAdopters);
      setSubmitted(true);
      toast.success("¡Bienvenido a la lista de early adopters!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrarte");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
    onOpenChange(false);
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setSubmitted(false);
      setFormData({
        email: "",
        role: "",
        contentFrequency: "",
        biggestChallenge: "",
        howDidYouFind: "",
      });
    }, 300);
  };

  const isStep1Valid = formData.email && formData.role;
  const isStep2Valid = formData.biggestChallenge;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl border-0"
        showCloseButton={!submitted}
      >
        {!submitted ? (
          <>
            {/* Header con gradiente */}
            <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-4 w-fit">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Early Access
              </div>

              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-white">
                  🎉 Has agotado tus {maxFreeValidations} validaciones gratuitas
                </DialogTitle>
                <p className="text-white/90 font-normal">
                  Únete a la lista de early adopters y obtén{" "}
                  <span className="font-bold text-cyan-200">+5 validaciones extra</span> +
                  acceso prioritario al lanzamiento.
                </p>
              </DialogHeader>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s <= step ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">Paso {step} de 2 • Solo 30 segundos</p>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {step === 1 ? (
                <>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tu email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="tu@email.com"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 h-auto"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      ¿Cuál es tu rol? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, role: role.id })
                          }
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            formData.role === role.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg mr-2">{role.icon}</span>
                          <span className="text-sm font-medium">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Frequency */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      ¿Con qué frecuencia creas contenido?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {frequencies.map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, contentFrequency: freq.id })
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            formData.contentFrequency === freq.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Biggest Challenge */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      ¿Cuál es tu mayor reto con el contenido?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {challenges.map((challenge) => (
                        <button
                          key={challenge.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              biggestChallenge: challenge.id,
                            })
                          }
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                            formData.biggestChallenge === challenge.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {challenge.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Source */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      ¿Cómo nos encontraste?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source) => (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, howDidYouFind: source.id })
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            formData.howDidYouFind === source.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {source.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Benefits reminder */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Al unirte obtienes:
                    </p>
                    <ul className="space-y-1.5 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        +5 validaciones extra inmediatas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        Acceso prioritario al lanzamiento
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        Precio especial de fundador (-40%)
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              {step === 2 && (
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Atrás
                </Button>
              )}
              <Button
                onClick={() => (step === 1 ? setStep(2) : handleSubmit())}
                disabled={
                  isSubmitting || (step === 1 ? !isStep1Valid : !isStep2Valid)
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : step === 1 ? (
                  "Continuar"
                ) : (
                  <>
                    Unirme a Early Access
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                ¡Bienvenido a bordo!
              </h3>
              <p className="text-gray-600">
                Ya tienes{" "}
                <span className="font-bold text-blue-600">+5 validaciones</span>{" "}
                disponibles.
              </p>
            </div>

            {position && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-gray-500">Tu posición en la lista:</p>
                <p className="text-3xl font-bold text-gray-900">#{position}</p>
                {totalAdopters && (
                  <p className="text-xs text-gray-400">
                    de {totalAdopters} early adopters
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleComplete}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Continuar validando →
            </Button>

            <p className="text-xs text-gray-400">
              Te avisaremos por email cuando lancemos oficialmente
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Archivo: `src/components/early-adopter/ValidationCounter.tsx`

Componente visual que muestra las validaciones restantes.

```typescript
// src/components/early-adopter/ValidationCounter.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";

interface ValidationCounterProps {
  remaining: number;
  total: number;
  isEarlyAdopter: boolean;
  onUpgradeClick?: () => void;
}

export function ValidationCounter({
  remaining,
  total,
  isEarlyAdopter,
  onUpgradeClick,
}: ValidationCounterProps) {
  const percentage = (remaining / total) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Counter badge */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
        {/* Progress indicator */}
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-gray-200"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
              r="15"
              cx="18"
              cy="18"
            />
            <circle
              className={`${remaining === 0 ? 'text-red-500' : remaining <= 1 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-500`}
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="15"
              cx="18"
              cy="18"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {remaining}
          </span>
        </div>

        <div className="flex flex-col">
          <span className={`text-sm font-medium ${
            remaining === 0 ? "text-red-600" : remaining <= 1 ? "text-amber-600" : "text-gray-600"
          }`}>
            {remaining === 0 ? (
              "Sin validaciones"
            ) : (
              <>
                {remaining} de {total}
              </>
            )}
          </span>
          <span className="text-xs text-gray-400">
            {isEarlyAdopter ? "Early Adopter" : "Plan gratuito"}
          </span>
        </div>
      </div>

      {/* Early adopter badge or upgrade button */}
      {isEarlyAdopter ? (
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300 px-3 py-1"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Early Adopter
        </Badge>
      ) : remaining <= 1 && onUpgradeClick ? (
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          Obtener más
        </button>
      ) : null}
    </div>
  );
}
```

---

## PASO 5: MODIFICAR COMPONENTES EXISTENTES

### Archivo: `src/app/page.tsx` (REEMPLAZAR COMPLETO)

Página principal con integración del sistema de early adopters.

```typescript
// src/app/page.tsx
"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { ResultsDisplay } from "@/components/landing/ResultsDisplay";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CTASection } from "@/components/landing/CTASection";
import { EarlyAdopterModal } from "@/components/early-adopter/EarlyAdopterModal";
import { ValidationCounter } from "@/components/early-adopter/ValidationCounter";
import { useValidationLimit } from "@/hooks/use-validation-limit";
import { toast } from "sonner";

interface ValidationResult {
  demand_score: number;
  demand_interpretation: string;
  demand_summary: string;
  strategic_recommendation: {
    verdict: "create" | "pilot" | "reconsider";
    reasoning: string[];
    target_fit: string;
    success_conditions: string;
  };
  data_signals: {
    conversations_analyzed: number;
    recency: string;
    engagement_type: string;
  };
  business_impact: {
    primary_objective: "leads" | "authority" | "sales";
    monetization_potential: string;
    commercial_risks: string;
  };
  pain_points: string[];
  questions: string[];
  content_angles: {
    format: string;
    hook: string;
    complexity: "básico" | "avanzado";
    description: string;
  }[];
  not_recommended_if: string[];
  confidence_score: number;
  remaining_validations?: number;
}

export default function LandingPage() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validatedTopic, setValidatedTopic] = useState("");
  const [showEarlyAdopterModal, setShowEarlyAdopterModal] = useState(false);

  // Rate limiting hook
  const {
    remaining,
    total,
    isLimited,
    isLoading: limitLoading,
    isEarlyAdopter,
    fingerprint,
    recordUsage,
    grantEarlyAdopterBonus,
  } = useValidationLimit();

  const handleValidate = async (topic: string, audience: string) => {
    // Check if user has validations remaining
    if (isLimited) {
      setShowEarlyAdopterModal(true);
      return;
    }

    setIsValidating(true);
    setResult(null);
    setValidatedTopic(topic);

    try {
      const response = await fetch("/api/validate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          audience,
          clientId: fingerprint 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          // Rate limited - show modal
          setShowEarlyAdopterModal(true);
          toast.error("Has alcanzado el límite gratuito.");
          return;
        }
        throw new Error(error.message || "Error al validar");
      }

      const data = await response.json();
      setResult(data);
      
      // Record the usage
      await recordUsage();

      // Show warning if low on validations
      if (remaining - 1 === 1) {
        toast.warning("Te queda 1 validación gratuita", {
          action: {
            label: "Obtener más",
            onClick: () => setShowEarlyAdopterModal(true),
          },
        });
      } else if (remaining - 1 === 0) {
        toast.info("Has usado todas tus validaciones gratuitas", {
          action: {
            label: "Unirme a Early Access",
            onClick: () => setShowEarlyAdopterModal(true),
          },
        });
      }

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      }, 100);

    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Error al validar la idea. Inténtalo de nuevo.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEarlyAdopterSuccess = () => {
    grantEarlyAdopterBonus();
    toast.success("¡+5 validaciones desbloqueadas!");
  };

  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />

      {/* Floating validation counter - shows after first interaction or when low */}
      {!limitLoading && (remaining < total || result) && (
        <div className="fixed top-20 right-4 z-40 animate-in slide-in-from-right duration-300">
          <ValidationCounter
            remaining={remaining}
            total={total}
            isEarlyAdopter={isEarlyAdopter}
            onUpgradeClick={() => setShowEarlyAdopterModal(true)}
          />
        </div>
      )}

      <Hero 
        onValidate={handleValidate} 
        isValidating={isValidating}
        remainingValidations={remaining}
        isLimited={isLimited}
        onLimitedClick={() => setShowEarlyAdopterModal(true)}
      />

      {/* Results section */}
      {result && (
        <section id="results" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ResultsDisplay 
              result={result} 
              topic={validatedTopic}
            />
          </div>
        </section>
      )}

      <ProblemSection />
      <FeaturesGrid />
      <CTASection />

      {/* Early Adopter Modal */}
      <EarlyAdopterModal
        open={showEarlyAdopterModal}
        onOpenChange={setShowEarlyAdopterModal}
        clientId={fingerprint}
        maxFreeValidations={3}
        onSuccess={handleEarlyAdopterSuccess}
      />
    </main>
  );
}
```

### Archivo: `src/components/landing/Hero.tsx` (REEMPLAZAR COMPLETO)

Componente Hero actualizado con indicador de validaciones y estado limitado.

```typescript
// src/components/landing/Hero.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeroProps {
  onValidate: (topic: string, audience: string) => void;
  isValidating: boolean;
  remainingValidations?: number;
  isLimited?: boolean;
  onLimitedClick?: () => void;
}

export function Hero({ 
  onValidate, 
  isValidating,
  remainingValidations,
  isLimited,
  onLimitedClick
}: HeroProps) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Analizando...");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLimited && onLimitedClick) {
      onLimitedClick();
      return;
    }

    if (topic.trim()) {
      const messages = [
        "Escaneando Reddit...",
        "Identificando dolores...",
        "Analizando demanda...",
        "Generando insights...",
        "Casi listo...",
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
      }, 2500);

      onValidate(topic, audience);

      setTimeout(() => clearInterval(interval), 30000);
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Investigación Estratégica con Datos Reales
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Toma decisiones de
              <br />
              <span className="text-cyan-100">contenido con menos riesgo</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Analizamos señales de demanda en comunidades reales para que no
              crees contenido a ciegas.
            </p>
          </div>

          {/* Live Validation Input */}
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden max-w-3xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    className="text-lg px-6 py-6 border-2 border-gray-200 focus:border-blue-500 rounded-2xl"
                    placeholder="Ej: Cómo crear newsletters para dentistas"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isValidating}
                    required
                  />

                  <Input
                    className="text-base px-6 py-4 border-2 border-gray-200 focus:border-blue-500 rounded-2xl"
                    placeholder="Audiencia (opcional): Ej. Dentistas"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={isValidating}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold ${
                    isLimited 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isValidating || !topic.trim()}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : isLimited ? (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Desbloquear más validaciones
                    </>
                  ) : (
                    <>
                      Validar ahora gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  {isLimited ? (
                    <span className="text-amber-600 font-medium">
                      Únete a Early Access para continuar validando
                    </span>
                  ) : remainingValidations !== undefined ? (
                    <span className="text-gray-500">
                      Sin registro • 
                      <span className={`font-medium ml-1 ${
                        remainingValidations <= 1 ? "text-amber-600" : "text-gray-600"
                      }`}>
                        {remainingValidations} validaciones restantes
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Sin registro • Resultados en segundos • Gratis
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
```

---

## PASO 6: VERIFICAR DEPENDENCIAS

### Componentes de shadcn/ui requeridos

Asegúrate de que estos componentes están instalados:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

### Dependencias npm adicionales

```bash
# Si no tienes sonner para toasts
npm install sonner

# Asegúrate de tener lucide-react
npm install lucide-react
```

### Configuración de Sonner

Si no tienes Sonner configurado, añádelo al layout:

```typescript
// src/app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

---

## PASO 7: MODIFICAR COMPONENTE DIALOG (SI ES NECESARIO)

El componente `DialogContent` necesita soportar la prop `showCloseButton`. Si tu versión actual no la tiene, modifica el archivo:

### Archivo: `src/components/ui/dialog.tsx`

Busca el componente `DialogContent` y asegúrate de que acepta `showCloseButton`:

```typescript
function DialogContent({
  className,
  children,
  showCloseButton = true, // Añadir esta prop con valor por defecto
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}
```

---

## PASO 8: TESTING Y VERIFICACIÓN

### Checklist de verificación

1. **Base de datos**
   - [ ] Las tablas `early_adopters` y `anonymous_usage` existen
   - [ ] Las políticas RLS están activas
   - [ ] Las vistas de analytics funcionan

2. **API Routes**
   - [ ] `/api/rate-limit/check` responde correctamente
   - [ ] `/api/rate-limit/record` registra el uso
   - [ ] `/api/early-adopters` registra nuevos usuarios

3. **Frontend**
   - [ ] El fingerprint se genera y persiste en localStorage
   - [ ] El contador de validaciones aparece correctamente
   - [ ] El modal se abre cuando se agota el límite
   - [ ] El formulario de 2 pasos funciona
   - [ ] El bonus de +5 se aplica después del registro

### Flujo de prueba manual

1. Abre la aplicación en modo incógnito
2. Verifica que aparece "3 validaciones restantes"
3. Realiza 3 validaciones
4. En la 3ª, verifica que aparece el modal
5. Completa el formulario
6. Verifica que ahora tienes 5 validaciones
7. Verifica en Supabase que el registro aparece en `early_adopters`

---

## NOTAS IMPORTANTES

### Constantes configurables

```typescript
// En src/hooks/use-validation-limit.ts
const FREE_LIMIT = 3;           // Validaciones gratuitas
const EARLY_ADOPTER_BONUS = 5;  // Bonus al registrarse

// En src/app/api/rate-limit/record/route.ts
const FREE_LIMIT = 3;
const EARLY_ADOPTER_LIMIT = 8;  // 3 + 5
```

### Ventana de tiempo del rate limit

Por defecto, el rate limit se calcula sobre los últimos 30 días. Para cambiar esto, modifica:

```typescript
// En las API routes
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Cambiar 30 por otro valor
```

### Limpieza de datos antiguos

Para mantener la base de datos limpia, puedes programar una tarea que elimine registros antiguos:

```sql
-- Ejecutar periódicamente
DELETE FROM anonymous_usage 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## FIN DE LAS INSTRUCCIONES

Este documento contiene todas las instrucciones técnicas necesarias para implementar el sistema de Early Adopters en ContentValidator. Cada archivo está completo y listo para ser creado o reemplazado en el proyecto existente.