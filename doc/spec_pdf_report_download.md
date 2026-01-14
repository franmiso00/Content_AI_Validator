# Especificación: Descarga de Reporte en PDF - Valio.pro

## 📋 Resumen Ejecutivo

**Objetivo:** Implementar la funcionalidad de descarga del reporte de validación en formato PDF con branding profesional de Valio.pro.

**Usuario final:** Creadores de contenido, agencias, startups B2B y coaches que usan la herramienta para validar ideas de contenido.

**Valor añadido:** Permite a los usuarios guardar, compartir e imprimir los resultados de validación para presentaciones a clientes, toma de decisiones en equipo y documentación de estrategia de contenido.

---

## 🎯 Funcionalidad Requerida

### 1. Botón de Descarga

**Ubicación:** En el componente `ResultsDisplay.tsx`, junto a los botones existentes (Crear cuenta / Validar otra idea).

**Comportamiento:**
- Visible solo cuando hay un resultado de validación (`result !== null`)
- Al hacer clic, genera el PDF en el cliente/servidor y descarga automáticamente
- Nombre del archivo: `valio-report-{fecha}-{slug-tema}.pdf`
  - Ejemplo: `valio-report-2026-01-14-newsletter-para-dentistas.pdf`

**Estado de carga:**
- Mostrar spinner/loading mientras se genera el PDF
- Texto del botón: "Generando PDF..." durante la carga

### 2. Contenido del PDF

El PDF debe incluir todas las secciones del reporte actual:

```typescript
interface PDFReportContent {
  // Metadata
  generatedAt: string;          // Fecha y hora de generación
  topic: string;                // Tema validado
  audience?: string;            // Audiencia objetivo (si se proporcionó)
  
  // Secciones del reporte
  verdict: {
    type: 'create' | 'pilot' | 'reconsider';
    label: string;
    reasoning: string[];
    targetFit: string;
    successConditions: string;
  };
  
  demandAnalysis: {
    score: number;
    interpretation: string;
    summary: string;
  };
  
  dataSignals: {
    conversationsAnalyzed: number;
    recency: string;
    engagementType: string;
  };
  
  businessImpact: {
    primaryObjective: 'leads' | 'authority' | 'sales';
    monetizationPotential: string;
    commercialRisks: string;
  };
  
  painPoints: string[];
  questions: string[];
  
  contentAngles: Array<{
    format: string;
    hook: string;
    complexity: 'básico' | 'avanzado';
    description: string;
  }>;
  
  notRecommendedIf: string[];
  confidenceScore: number;
}
```

---

## 🎨 Branding & Diseño Visual

### Paleta de Colores de Valio.pro

```css
/* Colores Principales */
--valio-primary: #2563eb;        /* Blue 600 - Color principal */
--valio-primary-dark: #1d4ed8;   /* Blue 700 */
--valio-accent: #06b6d4;         /* Cyan 500 - Acentos */
--valio-gradient-start: #2563eb; /* Gradiente de azul */
--valio-gradient-end: #06b6d4;   /* Gradiente a cyan */

/* Colores de Veredicto */
--verdict-create: #10b981;       /* Emerald 500 - Verde */
--verdict-create-bg: #d1fae5;    /* Emerald 100 */
--verdict-pilot: #f59e0b;        /* Amber 500 - Amarillo */
--verdict-pilot-bg: #fef3c7;     /* Amber 100 */
--verdict-reconsider: #f43f5e;   /* Rose 500 - Rojo */
--verdict-reconsider-bg: #ffe4e6;/* Rose 100 */

/* Neutros */
--text-primary: #111827;         /* Gray 900 */
--text-secondary: #4b5563;       /* Gray 600 */
--text-muted: #9ca3af;           /* Gray 400 */
--bg-light: #f9fafb;             /* Gray 50 */
--border: #e5e7eb;               /* Gray 200 */
```

### Tipografía

```css
/* Fuentes */
--font-primary: 'Inter', 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;

/* Tamaños (para PDF a 72dpi) */
--font-title: 28pt;
--font-heading1: 20pt;
--font-heading2: 16pt;
--font-heading3: 14pt;
--font-body: 11pt;
--font-small: 9pt;
--font-caption: 8pt;
```

### Elementos Visuales

1. **Logo de Valio.pro:**
   - Posición: Esquina superior izquierda del header
   - Tamaño: 120px de ancho
   - Versión: Logo principal con texto "Valio.pro"

2. **Header de Página:**
   - Fondo: Gradiente linear de `--valio-primary` a `--valio-accent`
   - Altura: 80px
   - Contenido: Logo + "Reporte de Validación"

3. **Footer de Página:**
   - Texto: "Generado con Valio.pro · valio.pro · {fecha}"
   - Número de página: "Página X de Y"
   - Color: `--text-muted`

4. **Cards/Secciones:**
   - Border radius: 12px
   - Borde: 1px solid `--border`
   - Sombra: Sutil (0 1px 3px rgba(0,0,0,0.1))
   - Padding interno: 20px

---

## 📄 Template del PDF - Estructura de Páginas

### PÁGINA 1: Portada y Veredicto

```
┌─────────────────────────────────────────────────────────┐
│  ████████████████████████████████████████████████████  │ ← Header con gradiente
│  [LOGO VALIO.PRO]         Reporte de Validación        │
│  ████████████████████████████████████████████████████  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  VEREDICTO ESTRATÉGICO                  │ ← Título centrado
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              "{TEMA VALIDADO}"                  │   │ ← Tema en quotes
│  │                                                 │   │
│  │         Audiencia: {audiencia}                  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ┌─────────────┐  ┌───────────────────────────┐ │   │ ← Card de veredicto
│  │ │             │  │                           │ │   │
│  │ │  [ICONO]    │  │  Razonamiento:            │ │   │
│  │ │  CREAR /    │  │  • Punto 1                │ │   │
│  │ │  PILOTO /   │  │  • Punto 2                │ │   │
│  │ │  NO PRIOR.  │  │  • Punto 3                │ │   │
│  │ │             │  │                           │ │   │
│  │ └─────────────┘  └───────────────────────────┘ │   │
│  │                                                 │   │
│  │  Ideal para: {target_fit}                      │   │
│  │  Condición de éxito: {success_conditions}      │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Generado: {fecha} · valio.pro                 Pág 1/4  │ ← Footer
└─────────────────────────────────────────────────────────┘
```

### PÁGINA 2: Análisis de Demanda y Señales

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO VALIO.PRO]         Reporte de Validación        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ANÁLISIS DE DEMANDA                                    │
│  ─────────────────────                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │   DEMAND SCORE:  ████████░░  72/100            │   │ ← Barra visual
│  │                  DEMANDA MODERADA              │   │
│  │                                                 │   │
│  │   {demand_summary - texto explicativo}          │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  SEÑALES DE DATOS                                       │
│  ─────────────────                                      │
│                                                         │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
│  │ Conversaciones│ │   Recencia    │ │  Engagement   │ │
│  │      15       │ │  Últimos 30d  │ │   Preguntas   │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ │
│                                                         │
│  IMPACTO DE NEGOCIO                                     │
│  ──────────────────                                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Objetivo principal: LEADS                       │   │
│  │ Potencial de monetización: {texto}              │   │
│  │ Riesgos comerciales: {texto}                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Generado: {fecha} · valio.pro                 Pág 2/4  │
└─────────────────────────────────────────────────────────┘
```

### PÁGINA 3: Insights del Mercado

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO VALIO.PRO]         Reporte de Validación        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DOLORES Y FRUSTRACIONES DETECTADOS                     │
│  ────────────────────────────────────                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • {pain_point_1}                                │   │
│  │ • {pain_point_2}                                │   │
│  │ • {pain_point_3}                                │   │
│  │ • {pain_point_4}                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  PREGUNTAS FRECUENTES DE LA AUDIENCIA                   │
│  ─────────────────────────────────────                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • {question_1}                                  │   │
│  │ • {question_2}                                  │   │
│  │ • {question_3}                                  │   │
│  │ • {question_4}                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚠️ NO RECOMENDADO SI...                                │
│  ───────────────────────                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • {not_recommended_1}                           │   │
│  │ • {not_recommended_2}                           │   │
│  │ • {not_recommended_3}                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Generado: {fecha} · valio.pro                 Pág 3/4  │
└─────────────────────────────────────────────────────────┘
```

### PÁGINA 4: Ángulos de Contenido Recomendados

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO VALIO.PRO]         Reporte de Validación        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ÁNGULOS DE CONTENIDO RECOMENDADOS                      │
│  ──────────────────────────────────                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. {FORMATO}                         [BÁSICO]  │   │
│  │    ───────────────────────────────────────────  │   │
│  │    Hook: "{hook_text}"                          │   │
│  │                                                 │   │
│  │    {description}                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 2. {FORMATO}                       [AVANZADO]  │   │
│  │    ───────────────────────────────────────────  │   │
│  │    Hook: "{hook_text}"                          │   │
│  │                                                 │   │
│  │    {description}                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 3. {FORMATO}                         [BÁSICO]  │   │
│  │    ───────────────────────────────────────────  │   │
│  │    Hook: "{hook_text}"                          │   │
│  │                                                 │   │
│  │    {description}                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            NIVEL DE CONFIANZA: 85%             │   │
│  │  ████████████████░░░░  Este análisis se basa   │   │
│  │  en {n} conversaciones reales de la comunidad. │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  ¿Necesitas más validaciones? Visita valio.pro          │
│  ─────────────────────────────────────────────────────  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Generado: {fecha} · valio.pro                 Pág 4/4  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Opción Recomendada: Generación en Cliente con jsPDF + html2canvas

**Ventajas:**
- No requiere servidor adicional
- Renderiza exactamente lo que ve el usuario
- Soporta estilos complejos y gradientes

**Dependencias:**
```bash
npm install jspdf html2canvas
```

### Estructura de Archivos

```
src/
├── lib/
│   └── pdf/
│       ├── generate-report-pdf.ts    # Lógica principal de generación
│       ├── pdf-template.tsx          # Componente React del template
│       ├── pdf-styles.ts             # Estilos y constantes de diseño
│       └── pdf-assets.ts             # Logo en base64, iconos
│
├── components/
│   └── landing/
│       └── ResultsDisplay.tsx        # Agregar botón de descarga
│
└── hooks/
    └── use-pdf-download.ts           # Hook para manejar la descarga
```

### API del Componente

```typescript
// src/hooks/use-pdf-download.ts
import { useState } from 'react';
import { generateReportPDF } from '@/lib/pdf/generate-report-pdf';

interface UsePDFDownloadOptions {
  result: ValidationResult;
  topic: string;
  audience?: string;
}

export function usePDFDownload({ result, topic, audience }: UsePDFDownloadOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await generateReportPDF({
        result,
        topic,
        audience,
        filename: generateFilename(topic),
      });
    } catch (err) {
      setError('Error al generar el PDF. Por favor, intenta de nuevo.');
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadPDF, isGenerating, error };
}

function generateFilename(topic: string): string {
  const date = new Date().toISOString().split('T')[0];
  const slug = topic
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  
  return `valio-report-${date}-${slug}.pdf`;
}
```

### Implementación del Generador

```typescript
// src/lib/pdf/generate-report-pdf.ts
import jsPDF from 'jspdf';
import { VALIO_COLORS, VALIO_FONTS } from './pdf-styles';
import { VALIO_LOGO_BASE64 } from './pdf-assets';

interface GeneratePDFOptions {
  result: ValidationResult;
  topic: string;
  audience?: string;
  filename: string;
}

export async function generateReportPDF(options: GeneratePDFOptions): Promise<void> {
  const { result, topic, audience, filename } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // === PÁGINA 1: Portada y Veredicto ===
  renderHeader(doc, pageWidth);
  renderVerdictPage(doc, result, topic, audience, margin, contentWidth);
  renderFooter(doc, pageWidth, pageHeight, 1, 4);

  // === PÁGINA 2: Análisis de Demanda ===
  doc.addPage();
  renderHeader(doc, pageWidth);
  renderDemandAnalysisPage(doc, result, margin, contentWidth);
  renderFooter(doc, pageWidth, pageHeight, 2, 4);

  // === PÁGINA 3: Insights del Mercado ===
  doc.addPage();
  renderHeader(doc, pageWidth);
  renderMarketInsightsPage(doc, result, margin, contentWidth);
  renderFooter(doc, pageWidth, pageHeight, 3, 4);

  // === PÁGINA 4: Ángulos de Contenido ===
  doc.addPage();
  renderHeader(doc, pageWidth);
  renderContentAnglesPage(doc, result, margin, contentWidth);
  renderFooter(doc, pageWidth, pageHeight, 4, 4);

  // Guardar el PDF
  doc.save(filename);
}
```

### Integración en ResultsDisplay

```tsx
// Agregar al componente ResultsDisplay.tsx

import { usePDFDownload } from '@/hooks/use-pdf-download';
import { Download, Loader2 } from 'lucide-react';

// Dentro del componente:
const { downloadPDF, isGenerating, error } = usePDFDownload({
  result,
  topic,
  audience: undefined, // Pasar si está disponible
});

// En el JSX, junto a los otros botones:
<Button
  size="lg"
  variant="outline"
  className="border-white/30 bg-white/5 text-white hover:bg-white/10 py-7 px-10 rounded-2xl font-black text-lg backdrop-blur-sm"
  onClick={downloadPDF}
  disabled={isGenerating}
>
  {isGenerating ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Generando PDF...
    </>
  ) : (
    <>
      <Download className="mr-2 h-5 w-5" />
      Descargar PDF
    </>
  )}
</Button>
```

---

## 📐 Especificaciones del Logo

### Logo Principal de Valio.pro

El logo debe crearse/exportarse con las siguientes especificaciones:

```
┌────────────────────────────────────┐
│                                    │
│   ◆ Valio.pro                      │
│                                    │
└────────────────────────────────────┘

Descripción del logo:
- Símbolo: Diamante/checkmark geométrico en azul (#2563eb)
- Texto: "Valio" en negrita + ".pro" en peso regular
- Fuente: Inter Bold / Geist Sans Bold
- Colores: Azul primario (#2563eb) o blanco (para fondos oscuros)
```

**Formatos necesarios:**
1. `valio-logo-dark.png` - Logo azul para fondos claros (300x80px)
2. `valio-logo-light.png` - Logo blanco para fondos oscuros (300x80px)
3. `valio-logo.svg` - Versión vectorial
4. Base64 embebido para el PDF

### Iconos del Veredicto

```typescript
// Iconos SVG para cada veredicto (embebidos en base64)
const VERDICT_ICONS = {
  create: `<svg>...</svg>`,    // Checkmark en círculo verde
  pilot: `<svg>...</svg>`,     // Triángulo de alerta amarillo
  reconsider: `<svg>...</svg>` // X en círculo rojo
};
```

---

## ✅ Criterios de Aceptación

### Funcionales

- [ ] El botón de descarga aparece solo cuando hay resultados
- [ ] El PDF se genera correctamente con todos los datos del reporte
- [ ] El archivo descargado tiene el nombre correcto con fecha y tema
- [ ] Todas las secciones del reporte están presentes en el PDF
- [ ] El veredicto muestra el color correcto según el tipo

### Visuales

- [ ] El logo de Valio.pro aparece en todas las páginas
- [ ] Los colores del veredicto coinciden con la versión web
- [ ] La tipografía es legible y profesional
- [ ] Los gradientes del header se renderizan correctamente
- [ ] Las barras de progreso (demand score, confidence) son visibles

### Técnicos

- [ ] El PDF se genera en menos de 3 segundos
- [ ] El tamaño del archivo no excede 2MB
- [ ] El PDF es compatible con lectores estándar (Preview, Acrobat, etc.)
- [ ] No hay errores en consola durante la generación
- [ ] El estado de carga se muestra correctamente

### UX

- [ ] Feedback visual durante la generación (spinner)
- [ ] Mensaje de error claro si falla la generación
- [ ] El botón se deshabilita durante la generación
- [ ] La descarga inicia automáticamente al completar

---

## 🚀 Plan de Implementación

### Fase 1: Setup (1-2 horas)
1. Instalar dependencias (jspdf, html2canvas si es necesario)
2. Crear estructura de archivos
3. Preparar assets (logo en base64, iconos)

### Fase 2: Template del PDF (3-4 horas)
1. Implementar funciones de renderizado por página
2. Configurar estilos y colores
3. Implementar header y footer reutilizables

### Fase 3: Integración (1-2 horas)
1. Crear hook `usePDFDownload`
2. Integrar botón en `ResultsDisplay`
3. Manejar estados de carga y error

### Fase 4: Testing y Refinamiento (2 horas)
1. Probar con diferentes tipos de veredictos
2. Verificar renderizado en distintos dispositivos
3. Ajustar espaciados y tipografía
4. Optimizar tamaño del archivo

**Tiempo total estimado: 8-10 horas**

---

## 📎 Recursos Adicionales

### Dependencias NPM
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"  // Opcional, solo si se usa html2canvas
}
```

### Referencias
- [jsPDF Documentation](https://rawgit.com/MrRio/jsPDF/master/docs/)
- [html2canvas](https://html2canvas.hertzen.com/)

### Assets para crear
1. Logo de Valio.pro en formato PNG y base64
2. Iconos SVG de veredictos
3. Patrón de fondo opcional para header

---

## 💡 Consideraciones Adicionales

### Accesibilidad
- El PDF debe tener texto seleccionable (no imagen)
- Incluir metadatos del documento (título, autor)

### Internacionalización
- El template actual está en español
- La fecha debe formatearse según locale español ("14 de enero de 2026")

### Futuras Mejoras
- Añadir QR code que enlace al reporte online
- Opción de compartir por email
- Versión de reporte resumido (1 página)
- Exportar a otros formatos (DOCX, Google Docs)

---

*Especificación creada para Valio.pro - Validación de Ideas de Contenido*
*Versión: 1.0 | Fecha: Enero 2026*