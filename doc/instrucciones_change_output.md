# 🚀 Output Mejorado - Guía de Integración

## Resumen de Cambios

Este update mejora el **output** de la herramienta para que:
1. Valide si el formato elegido por el usuario es óptimo
2. Valide si el objetivo indicado está alineado con la demanda
3. Valide si el nivel de audiencia es apropiado
4. Use los nuevos campos del input mejorado

---

## Archivos a Reemplazar

### 1. `src/lib/perplexity.ts`
Reemplaza completamente con el contenido de `perplexity.ts`

**Cambios principales:**
- Nueva interfaz `ValidationInput` que recibe todos los campos del input
- Nuevas interfaces para los assessments (formato, objetivo, nivel)
- Prompt mejorado que valida las elecciones del usuario
- Respuestas en español

### 2. `src/app/api/validate-demo/route.ts`
Reemplaza completamente con el contenido de `route.ts`

**Cambios principales:**
- Recibe los nuevos campos: `contentType`, `objective`, `audienceLevel`
- Construye el objeto `ValidationInput` para Perplexity
- Devuelve los inputs del usuario en la respuesta

### 3. `src/components/landing/ResultsDisplay.tsx`
Reemplaza completamente con el contenido de `ResultsDisplay.tsx`

**Cambios principales:**
- Nueva sección "Validación de tus Elecciones" con 3 cards
- Indicadores visuales verde/ámbar según si la elección es óptima
- Muestra la recomendación alternativa si no es óptimo
- Iconos dinámicos según el tipo de contenido

---

## Nuevas Interfaces TypeScript

### ValidationInput (para la API)
```typescript
interface ValidationInput {
    topic: string;
    audience?: string;
    contentType?: string;      // article | newsletter | video-long | video-short | social | guide
    objective?: string;        // leads | sales | authority | awareness
    audienceLevel?: string;    // beginner | intermediate | advanced
}
```

### Nuevos campos en la respuesta
```typescript
interface FormatAssessment {
    chosen_format: string;
    recommended_format: string;
    is_optimal: boolean;
    reasoning: string;
    alternative_suggestion?: string;
}

interface ObjectiveAssessment {
    chosen_objective: string;
    recommended_objective: "leads" | "authority" | "sales" | "awareness";
    is_aligned: boolean;
    reasoning: string;
}

interface AudienceLevelAssessment {
    chosen_level: string;
    recommended_level: "beginner" | "intermediate" | "advanced";
    is_appropriate: boolean;
    reasoning: string;
}
```

---

## Flujo de Validación

```
┌─────────────────────────────────────────────────────────────────┐
│  Usuario ingresa:                                               │
│  • Tema: "Newsletter para abogados que usan IA"                │
│  • Formato: "Video largo"                                       │
│  • Objetivo: "Generar leads"                                    │
│  • Nivel: "Avanzado"                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Perplexity analiza Reddit y detecta:                          │
│  • La audiencia prefiere contenido escrito (newsletters)       │
│  • El objetivo "autoridad" tiene más señales que "leads"       │
│  • La audiencia es mayormente intermedia, no avanzada          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Output muestra:                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ⚠️ VALIDACIÓN DE TUS ELECCIONES                          │ │
│  │                                                           │ │
│  │ 🟡 Formato: Video largo → Recomendado: Newsletter        │ │
│  │    "Los abogados prefieren contenido escrito..."         │ │
│  │                                                           │ │
│  │ 🟡 Objetivo: Leads → Recomendado: Autoridad              │ │
│  │    "El nicho responde mejor a contenido educativo..."    │ │
│  │                                                           │ │
│  │ 🟡 Nivel: Avanzado → Recomendado: Intermedio             │ │
│  │    "La mayoría de conversaciones son de nivel medio..."  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Visualización en el UI

### Si la elección ES óptima:
```
┌─────────────────────────────────┐
│ 📄 Formato           ✅ Óptimo │
│                                 │
│ Tu elección                     │
│ Newsletter                      │
│                                 │
│ El formato newsletter es ideal  │
│ para este nicho porque...       │
└─────────────────────────────────┘
```

### Si la elección NO es óptima:
```
┌─────────────────────────────────┐
│ 🎥 Formato         ⚠️ Mejorable│
│                                 │
│ Tu elección                     │
│ Video largo                     │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Recomendado                 ││
│ │ Newsletter                  ││
│ └─────────────────────────────┘│
│                                 │
│ Los abogados prefieren leer    │
│ contenido en lugar de videos...│
└─────────────────────────────────┘
```

---

## Integración con Hero Mejorado

Asegúrate de que el `page.tsx` envíe todos los campos:

```typescript
const handleValidate = async (data: ValidationInput) => {
    const response = await fetch("/api/validate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            topic: data.topic,
            audience: data.audience,
            contentType: data.contentType,      // ← NUEVO
            objective: data.objective,          // ← NUEVO
            audienceLevel: data.audienceLevel,  // ← NUEVO
        }),
    });
    // ...
};
```

---

## Beneficios de esta Mejora

| Antes | Después |
|-------|---------|
| El usuario no sabe si su formato es bueno | Validación explícita con ✅ o ⚠️ |
| Solo recomendaciones genéricas | Feedback personalizado a sus elecciones |
| Output igual para todos | Output adaptado a lo que eligió |
| Usuario pasivo | Usuario aprende de sus decisiones |

---

## Orden de Archivos a Actualizar

1. ✅ `src/lib/perplexity.ts` (lógica y prompt)
2. ✅ `src/app/api/validate-demo/route.ts` (API)
3. ✅ `src/components/landing/ResultsDisplay.tsx` (UI)
4. ✅ `src/components/landing/Hero.tsx` (del paso anterior)
5. ✅ `src/app/page.tsx` (del paso anterior)

---

## Testing

Para probar la validación:

1. Elige un tema de **newsletters** → selecciona formato **Video largo**
2. El output debería mostrar ⚠️ en formato y recomendar Newsletter

3. Elige un tema **técnico avanzado** → selecciona nivel **Principiante**
4. El output debería mostrar ⚠️ en nivel y recomendar Intermedio/Avanzado

---

## Notas Técnicas

- El prompt de Perplexity ahora es más largo (~2500 tokens)
- Se mantiene el modelo `sonar` para costos bajos
- La temperatura se mantiene en 0.2 para consistencia
- Todas las respuestas son en español