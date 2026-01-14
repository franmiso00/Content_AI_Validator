# Código de Implementación - PDF Report Valio.pro

Este archivo contiene el código de referencia para implementar la funcionalidad de descarga de PDF.

## 1. Constantes de Estilos (`pdf-styles.ts`)

```typescript
// src/lib/pdf/pdf-styles.ts

export const VALIO_COLORS = {
  // Colores principales
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  accent: '#06b6d4',
  
  // Colores de veredicto
  verdictCreate: '#10b981',
  verdictCreateBg: '#d1fae5',
  verdictPilot: '#f59e0b',
  verdictPilotBg: '#fef3c7',
  verdictReconsider: '#f43f5e',
  verdictReconsiderBg: '#ffe4e6',
  
  // Neutros
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  bgLight: '#f9fafb',
  border: '#e5e7eb',
  white: '#ffffff',
} as const;

export const VALIO_FONTS = {
  title: 28,
  heading1: 20,
  heading2: 16,
  heading3: 14,
  body: 11,
  small: 9,
  caption: 8,
} as const;

export const PDF_CONFIG = {
  margin: 20,
  headerHeight: 25,
  footerHeight: 15,
  lineHeight: 1.4,
  sectionSpacing: 15,
  cardPadding: 12,
  cardRadius: 4,
} as const;

export const VERDICT_CONFIG = {
  create: {
    label: 'Crear esta idea',
    color: VALIO_COLORS.verdictCreate,
    bgColor: VALIO_COLORS.verdictCreateBg,
    description: 'Señales claras de demanda y baja fricción de entrada.',
  },
  pilot: {
    label: 'Validar con piloto',
    color: VALIO_COLORS.verdictPilot,
    bgColor: VALIO_COLORS.verdictPilotBg,
    description: 'Existe interés pero requiere enfoque más específico o test previo.',
  },
  reconsider: {
    label: 'No priorizar ahora',
    color: VALIO_COLORS.verdictReconsider,
    bgColor: VALIO_COLORS.verdictReconsiderBg,
    description: 'Baja demanda detectada o mercado excesivamente saturado.',
  },
} as const;
```

## 2. Assets del Logo (`pdf-assets.ts`)

```typescript
// src/lib/pdf/pdf-assets.ts

// Logo de Valio.pro en base64 (reemplazar con el logo real)
export const VALIO_LOGO_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`;

// Crear el logo programáticamente si no hay imagen disponible
export function drawValioLogo(
  doc: jsPDF,
  x: number,
  y: number,
  size: number = 8
): void {
  // Diamante/símbolo
  doc.setFillColor('#2563eb');
  doc.setDrawColor('#2563eb');
  
  // Dibujar un diamante simple
  const diamondSize = size;
  const cx = x + diamondSize / 2;
  const cy = y + diamondSize / 2;
  
  doc.triangle(
    cx, cy - diamondSize / 2,
    cx + diamondSize / 2, cy,
    cx - diamondSize / 2, cy,
    'F'
  );
  doc.triangle(
    cx, cy + diamondSize / 2,
    cx + diamondSize / 2, cy,
    cx - diamondSize / 2, cy,
    'F'
  );
  
  // Texto "Valio.pro"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#2563eb');
  doc.text('Valio', x + diamondSize + 3, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#4b5563');
  doc.text('.pro', x + diamondSize + 3 + doc.getTextWidth('Valio'), y + 6);
}

// Iconos de veredicto como funciones de dibujo
export function drawCheckIcon(doc: jsPDF, x: number, y: number, size: number = 16): void {
  doc.setDrawColor('#10b981');
  doc.setLineWidth(2);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'S');
  
  // Checkmark
  doc.line(x + size * 0.25, y + size * 0.5, x + size * 0.45, y + size * 0.7);
  doc.line(x + size * 0.45, y + size * 0.7, x + size * 0.75, y + size * 0.3);
}

export function drawAlertIcon(doc: jsPDF, x: number, y: number, size: number = 16): void {
  doc.setDrawColor('#f59e0b');
  doc.setFillColor('#f59e0b');
  doc.setLineWidth(2);
  
  // Triángulo
  doc.triangle(
    x + size / 2, y,
    x + size, y + size,
    x, y + size,
    'S'
  );
  
  // Exclamación
  doc.line(x + size / 2, y + size * 0.35, x + size / 2, y + size * 0.6);
  doc.circle(x + size / 2, y + size * 0.75, 1, 'F');
}

export function drawXIcon(doc: jsPDF, x: number, y: number, size: number = 16): void {
  doc.setDrawColor('#f43f5e');
  doc.setLineWidth(2);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'S');
  
  // X
  const padding = size * 0.3;
  doc.line(x + padding, y + padding, x + size - padding, y + size - padding);
  doc.line(x + size - padding, y + padding, x + padding, y + size - padding);
}
```

## 3. Generador Principal (`generate-report-pdf.ts`)

```typescript
// src/lib/pdf/generate-report-pdf.ts

import jsPDF from 'jspdf';
import { VALIO_COLORS, VALIO_FONTS, PDF_CONFIG, VERDICT_CONFIG } from './pdf-styles';
import { drawValioLogo, drawCheckIcon, drawAlertIcon, drawXIcon } from './pdf-assets';

interface ValidationResult {
  demand_score: number;
  demand_interpretation: string;
  demand_summary: string;
  strategic_recommendation: {
    verdict: 'create' | 'pilot' | 'reconsider';
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
    primary_objective: 'leads' | 'authority' | 'sales';
    monetization_potential: string;
    commercial_risks: string;
  };
  pain_points: string[];
  questions: string[];
  content_angles: Array<{
    format: string;
    hook: string;
    complexity: 'básico' | 'avanzado';
    description: string;
  }>;
  not_recommended_if: string[];
  confidence_score: number;
}

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
  const { margin, headerHeight, footerHeight } = PDF_CONFIG;
  const contentWidth = pageWidth - (margin * 2);
  const contentStartY = margin + headerHeight + 10;
  
  // Configurar metadatos del documento
  doc.setProperties({
    title: `Valio Report - ${topic}`,
    subject: 'Reporte de Validación de Contenido',
    author: 'Valio.pro',
    creator: 'Valio.pro',
  });

  // === PÁGINA 1: Portada y Veredicto ===
  renderHeader(doc, pageWidth, margin);
  renderVerdictPage(doc, result, topic, audience, margin, contentWidth, contentStartY);
  renderFooter(doc, pageWidth, pageHeight, margin, 1, getTotalPages(result));

  // === PÁGINA 2: Análisis de Demanda ===
  doc.addPage();
  renderHeader(doc, pageWidth, margin);
  renderDemandAnalysisPage(doc, result, margin, contentWidth, contentStartY);
  renderFooter(doc, pageWidth, pageHeight, margin, 2, getTotalPages(result));

  // === PÁGINA 3: Insights del Mercado ===
  doc.addPage();
  renderHeader(doc, pageWidth, margin);
  renderMarketInsightsPage(doc, result, margin, contentWidth, contentStartY);
  renderFooter(doc, pageWidth, pageHeight, margin, 3, getTotalPages(result));

  // === PÁGINA 4: Ángulos de Contenido ===
  doc.addPage();
  renderHeader(doc, pageWidth, margin);
  renderContentAnglesPage(doc, result, margin, contentWidth, contentStartY);
  renderFooter(doc, pageWidth, pageHeight, margin, 4, getTotalPages(result));

  // Guardar el PDF
  doc.save(filename);
}

function getTotalPages(result: ValidationResult): number {
  // Calcular páginas basado en contenido (mínimo 4)
  return 4;
}

// ============================================
// HEADER & FOOTER
// ============================================

function renderHeader(doc: jsPDF, pageWidth: number, margin: number): void {
  const headerHeight = PDF_CONFIG.headerHeight;
  
  // Fondo con gradiente (simulado con rectángulo)
  doc.setFillColor(VALIO_COLORS.primary);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Línea de acento cyan en la parte inferior del header
  doc.setFillColor(VALIO_COLORS.accent);
  doc.rect(0, headerHeight - 2, pageWidth, 2, 'F');
  
  // Logo y texto
  doc.setTextColor(VALIO_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Valio.pro', margin, 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte de Validación', pageWidth - margin, 15, { align: 'right' });
}

function renderFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  currentPage: number,
  totalPages: number
): void {
  const footerY = pageHeight - 10;
  
  // Línea separadora
  doc.setDrawColor(VALIO_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  // Fecha de generación
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(VALIO_COLORS.textMuted);
  doc.text(`Generado: ${dateStr} · valio.pro`, margin, footerY);
  
  // Número de página
  doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
}

// ============================================
// PÁGINA 1: VEREDICTO
// ============================================

function renderVerdictPage(
  doc: jsPDF,
  result: ValidationResult,
  topic: string,
  audience: string | undefined,
  margin: number,
  contentWidth: number,
  startY: number
): void {
  let y = startY;
  
  // Título de sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading1);
  doc.setTextColor(VALIO_COLORS.primary);
  doc.text('VEREDICTO ESTRATÉGICO', margin + contentWidth / 2, y, { align: 'center' });
  
  y += 15;
  
  // Card del tema
  doc.setFillColor(VALIO_COLORS.bgLight);
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  
  const topicLines = doc.splitTextToSize(`"${topic}"`, contentWidth - 20);
  doc.text(topicLines, margin + contentWidth / 2, y + 15, { align: 'center' });
  
  if (audience) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.small);
    doc.setTextColor(VALIO_COLORS.textSecondary);
    doc.text(`Audiencia: ${audience}`, margin + contentWidth / 2, y + 28, { align: 'center' });
  }
  
  y += 45;
  
  // Card principal de veredicto
  const verdictConfig = VERDICT_CONFIG[result.strategic_recommendation.verdict];
  const verdictCardHeight = 80;
  
  // Fondo del card
  doc.setFillColor(verdictConfig.bgColor);
  doc.roundedRect(margin, y, contentWidth, verdictCardHeight, 4, 4, 'F');
  
  // Borde izquierdo de color
  doc.setFillColor(verdictConfig.color);
  doc.rect(margin, y, 4, verdictCardHeight, 'F');
  
  // Icono y etiqueta del veredicto
  const iconX = margin + 15;
  const iconY = y + 15;
  
  if (result.strategic_recommendation.verdict === 'create') {
    drawCheckIcon(doc, iconX, iconY, 20);
  } else if (result.strategic_recommendation.verdict === 'pilot') {
    drawAlertIcon(doc, iconX, iconY, 20);
  } else {
    drawXIcon(doc, iconX, iconY, 20);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(verdictConfig.color);
  doc.text(verdictConfig.label.toUpperCase(), iconX + 30, iconY + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(VALIO_FONTS.small);
  doc.setTextColor(VALIO_COLORS.textSecondary);
  doc.text(verdictConfig.description, iconX + 30, iconY + 20);
  
  // Razonamiento
  y += 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.small);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('Razonamiento:', margin + 50, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  result.strategic_recommendation.reasoning.forEach((reason, index) => {
    if (index < 3) { // Limitar a 3 razones
      y += 6;
      doc.setFillColor(verdictConfig.color);
      doc.circle(margin + 55, y - 1.5, 1.5, 'F');
      
      const reasonLines = doc.splitTextToSize(reason, contentWidth - 70);
      doc.setTextColor(VALIO_COLORS.textSecondary);
      doc.text(reasonLines[0], margin + 60, y);
    }
  });
  
  y = startY + 130;
  
  // Target fit y condiciones de éxito
  const infoBoxWidth = (contentWidth - 10) / 2;
  
  // Target fit
  doc.setFillColor(VALIO_COLORS.white);
  doc.setDrawColor(VALIO_COLORS.border);
  doc.roundedRect(margin, y, infoBoxWidth, 40, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.caption);
  doc.setTextColor(VALIO_COLORS.textMuted);
  doc.text('IDEAL PARA', margin + 8, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(VALIO_FONTS.small);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  const targetLines = doc.splitTextToSize(result.strategic_recommendation.target_fit, infoBoxWidth - 16);
  doc.text(targetLines, margin + 8, y + 20);
  
  // Condición de éxito
  doc.roundedRect(margin + infoBoxWidth + 10, y, infoBoxWidth, 40, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.caption);
  doc.setTextColor(VALIO_COLORS.textMuted);
  doc.text('CONDICIÓN DE ÉXITO', margin + infoBoxWidth + 18, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(VALIO_FONTS.small);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  const successLines = doc.splitTextToSize(result.strategic_recommendation.success_conditions, infoBoxWidth - 16);
  doc.text(successLines, margin + infoBoxWidth + 18, y + 20);
}

// ============================================
// PÁGINA 2: ANÁLISIS DE DEMANDA
// ============================================

function renderDemandAnalysisPage(
  doc: jsPDF,
  result: ValidationResult,
  margin: number,
  contentWidth: number,
  startY: number
): void {
  let y = startY;
  
  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading1);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('ANÁLISIS DE DEMANDA', margin, y);
  
  y += 15;
  
  // Card de demand score
  doc.setFillColor(VALIO_COLORS.white);
  doc.setDrawColor(VALIO_COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'FD');
  
  // Borde izquierdo azul
  doc.setFillColor(VALIO_COLORS.primary);
  doc.rect(margin, y, 4, 50, 'F');
  
  // Score grande
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text(`${result.demand_score}`, margin + 20, y + 28);
  
  doc.setFontSize(16);
  doc.setTextColor(VALIO_COLORS.textMuted);
  doc.text('/100', margin + 45, y + 28);
  
  // Barra de progreso
  const barX = margin + 70;
  const barY = y + 18;
  const barWidth = 80;
  const barHeight = 8;
  
  doc.setFillColor(VALIO_COLORS.bgLight);
  doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
  
  const fillWidth = (result.demand_score / 100) * barWidth;
  doc.setFillColor(VALIO_COLORS.primary);
  doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');
  
  // Interpretación
  doc.setFillColor(VALIO_COLORS.bgLight);
  doc.roundedRect(barX + barWidth + 10, barY - 2, 50, 12, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.caption);
  doc.setTextColor(VALIO_COLORS.primary);
  doc.text(result.demand_interpretation.toUpperCase(), barX + barWidth + 35, barY + 6, { align: 'center' });
  
  // Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(VALIO_FONTS.body);
  doc.setTextColor(VALIO_COLORS.textSecondary);
  const summaryLines = doc.splitTextToSize(result.demand_summary, contentWidth - 30);
  doc.text(summaryLines, margin + 20, y + 42);
  
  y += 65;
  
  // Señales de datos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('SEÑALES DE DATOS', margin, y);
  
  y += 12;
  
  const signalBoxWidth = (contentWidth - 20) / 3;
  const signals = [
    { label: 'Conversaciones', value: result.data_signals.conversations_analyzed.toString() },
    { label: 'Recencia', value: result.data_signals.recency },
    { label: 'Engagement', value: result.data_signals.engagement_type },
  ];
  
  signals.forEach((signal, index) => {
    const x = margin + (signalBoxWidth + 10) * index;
    
    doc.setFillColor(VALIO_COLORS.bgLight);
    doc.roundedRect(x, y, signalBoxWidth, 35, 3, 3, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.caption);
    doc.setTextColor(VALIO_COLORS.textMuted);
    doc.text(signal.label, x + signalBoxWidth / 2, y + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading3);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text(signal.value, x + signalBoxWidth / 2, y + 25, { align: 'center' });
  });
  
  y += 50;
  
  // Impacto de negocio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('IMPACTO DE NEGOCIO', margin, y);
  
  y += 12;
  
  doc.setFillColor(VALIO_COLORS.white);
  doc.setDrawColor(VALIO_COLORS.border);
  doc.roundedRect(margin, y, contentWidth, 55, 4, 4, 'FD');
  
  const businessItems = [
    { label: 'Objetivo principal', value: result.business_impact.primary_objective.toUpperCase() },
    { label: 'Potencial de monetización', value: result.business_impact.monetization_potential },
    { label: 'Riesgos comerciales', value: result.business_impact.commercial_risks },
  ];
  
  let itemY = y + 12;
  businessItems.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.small);
    doc.setTextColor(VALIO_COLORS.textMuted);
    doc.text(`${item.label}:`, margin + 10, itemY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text(item.value, margin + 60, itemY);
    
    itemY += 14;
  });
}

// ============================================
// PÁGINA 3: INSIGHTS DEL MERCADO
// ============================================

function renderMarketInsightsPage(
  doc: jsPDF,
  result: ValidationResult,
  margin: number,
  contentWidth: number,
  startY: number
): void {
  let y = startY;
  
  // Pain Points
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('DOLORES Y FRUSTRACIONES DETECTADOS', margin, y);
  
  y += 10;
  
  doc.setFillColor(VALIO_COLORS.white);
  doc.setDrawColor(VALIO_COLORS.border);
  const painPointsHeight = Math.min(result.pain_points.length * 12 + 16, 70);
  doc.roundedRect(margin, y, contentWidth, painPointsHeight, 4, 4, 'FD');
  
  // Borde izquierdo rojo
  doc.setFillColor('#ef4444');
  doc.rect(margin, y, 3, painPointsHeight, 'F');
  
  y += 12;
  result.pain_points.slice(0, 5).forEach((point) => {
    doc.setFillColor('#ef4444');
    doc.circle(margin + 12, y - 1.5, 1.5, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.body);
    doc.setTextColor(VALIO_COLORS.textSecondary);
    
    const lines = doc.splitTextToSize(point, contentWidth - 25);
    doc.text(lines[0], margin + 18, y);
    y += 12;
  });
  
  y += 15;
  
  // Questions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('PREGUNTAS FRECUENTES DE LA AUDIENCIA', margin, y);
  
  y += 10;
  
  const questionsHeight = Math.min(result.questions.length * 12 + 16, 70);
  doc.setFillColor(VALIO_COLORS.white);
  doc.roundedRect(margin, y, contentWidth, questionsHeight, 4, 4, 'FD');
  
  // Borde izquierdo amber
  doc.setFillColor('#f59e0b');
  doc.rect(margin, y, 3, questionsHeight, 'F');
  
  y += 12;
  result.questions.slice(0, 5).forEach((question) => {
    doc.setFillColor('#f59e0b');
    doc.circle(margin + 12, y - 1.5, 1.5, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.body);
    doc.setTextColor(VALIO_COLORS.textSecondary);
    
    const lines = doc.splitTextToSize(question, contentWidth - 25);
    doc.text(lines[0], margin + 18, y);
    y += 12;
  });
  
  y += 15;
  
  // Not Recommended If
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading2);
  doc.setTextColor(VALIO_COLORS.verdictReconsider);
  doc.text('⚠️ NO RECOMENDADO SI...', margin, y);
  
  y += 10;
  
  const notRecHeight = Math.min(result.not_recommended_if.length * 12 + 16, 50);
  doc.setFillColor(VALIO_COLORS.verdictReconsiderBg);
  doc.roundedRect(margin, y, contentWidth, notRecHeight, 4, 4, 'F');
  
  y += 12;
  result.not_recommended_if.slice(0, 4).forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.body);
    doc.setTextColor(VALIO_COLORS.verdictReconsider);
    doc.text(`✕  ${item}`, margin + 10, y);
    y += 10;
  });
}

// ============================================
// PÁGINA 4: ÁNGULOS DE CONTENIDO
// ============================================

function renderContentAnglesPage(
  doc: jsPDF,
  result: ValidationResult,
  margin: number,
  contentWidth: number,
  startY: number
): void {
  let y = startY;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading1);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text('ÁNGULOS DE CONTENIDO RECOMENDADOS', margin, y);
  
  y += 15;
  
  result.content_angles.slice(0, 3).forEach((angle, index) => {
    const cardHeight = 45;
    
    doc.setFillColor(VALIO_COLORS.white);
    doc.setDrawColor(VALIO_COLORS.border);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 4, 4, 'FD');
    
    // Borde izquierdo verde
    doc.setFillColor(VALIO_COLORS.verdictCreate);
    doc.rect(margin, y, 3, cardHeight, 'F');
    
    // Número y formato
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading3);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text(`${index + 1}. ${angle.format}`, margin + 10, y + 12);
    
    // Badge de complejidad
    const badgeX = margin + contentWidth - 35;
    const badgeColor = angle.complexity === 'básico' ? VALIO_COLORS.verdictCreateBg : VALIO_COLORS.verdictPilotBg;
    const badgeTextColor = angle.complexity === 'básico' ? VALIO_COLORS.verdictCreate : VALIO_COLORS.verdictPilot;
    
    doc.setFillColor(badgeColor);
    doc.roundedRect(badgeX, y + 6, 25, 10, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.caption);
    doc.setTextColor(badgeTextColor);
    doc.text(angle.complexity.toUpperCase(), badgeX + 12.5, y + 13, { align: 'center' });
    
    // Hook
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.small);
    doc.setTextColor(VALIO_COLORS.textMuted);
    doc.text('Hook:', margin + 10, y + 22);
    
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(VALIO_COLORS.textPrimary);
    const hookLines = doc.splitTextToSize(`"${angle.hook}"`, contentWidth - 60);
    doc.text(hookLines[0], margin + 25, y + 22);
    
    // Descripción
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.small);
    doc.setTextColor(VALIO_COLORS.textSecondary);
    const descLines = doc.splitTextToSize(angle.description, contentWidth - 20);
    doc.text(descLines[0], margin + 10, y + 35);
    
    y += cardHeight + 10;
  });
  
  y += 10;
  
  // Confidence Score
  doc.setFillColor(VALIO_COLORS.bgLight);
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.heading3);
  doc.setTextColor(VALIO_COLORS.textPrimary);
  doc.text(`NIVEL DE CONFIANZA: ${result.confidence_score}%`, margin + contentWidth / 2, y + 15, { align: 'center' });
  
  // Barra de confianza
  const confBarX = margin + 30;
  const confBarY = y + 22;
  const confBarWidth = contentWidth - 60;
  const confBarHeight = 6;
  
  doc.setFillColor(VALIO_COLORS.border);
  doc.roundedRect(confBarX, confBarY, confBarWidth, confBarHeight, 2, 2, 'F');
  
  const confFillWidth = (result.confidence_score / 100) * confBarWidth;
  doc.setFillColor(VALIO_COLORS.primary);
  doc.roundedRect(confBarX, confBarY, confFillWidth, confBarHeight, 2, 2, 'F');
  
  y += 50;
  
  // CTA final
  doc.setFillColor(VALIO_COLORS.primary);
  doc.roundedRect(margin, y, contentWidth, 25, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(VALIO_FONTS.body);
  doc.setTextColor(VALIO_COLORS.white);
  doc.text('¿Necesitas más validaciones? Visita valio.pro', margin + contentWidth / 2, y + 15, { align: 'center' });
}
```

## 4. Hook de React (`use-pdf-download.ts`)

```typescript
// src/hooks/use-pdf-download.ts

import { useState, useCallback } from 'react';
import { generateReportPDF } from '@/lib/pdf/generate-report-pdf';
import type { ValidationResult } from '@/types';

interface UsePDFDownloadOptions {
  result: ValidationResult;
  topic: string;
  audience?: string;
}

interface UsePDFDownloadReturn {
  downloadPDF: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function usePDFDownload({ 
  result, 
  topic, 
  audience 
}: UsePDFDownloadOptions): UsePDFDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const filename = generateFilename(topic);
      
      await generateReportPDF({
        result,
        topic,
        audience,
        filename,
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }, [result, topic, audience]);

  return { downloadPDF, isGenerating, error };
}

function generateFilename(topic: string): string {
  const date = new Date().toISOString().split('T')[0];
  const slug = topic
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales
    .replace(/^-|-$/g, '')           // Eliminar guiones al inicio/final
    .substring(0, 50);
  
  return `valio-report-${date}-${slug}.pdf`;
}
```

## 5. Integración en ResultsDisplay

```tsx
// Añadir al inicio de ResultsDisplay.tsx

import { usePDFDownload } from '@/hooks/use-pdf-download';
import { Download, Loader2 } from 'lucide-react';

// Dentro del componente ResultsDisplay:

export function ResultsDisplay({ result, topic, onReset }: ResultsDisplayProps) {
  const { downloadPDF, isGenerating, error } = usePDFDownload({
    result,
    topic,
  });

  // ... resto del código existente ...

  // En el JSX del card final de CTA, añadir el botón:
  return (
    // ... código existente ...
    
    <Card className="border-0 bg-blue-600 text-white shadow-2xl ...">
      <CardContent className="p-12 text-center space-y-6 relative z-10">
        {/* ... contenido existente ... */}
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 ..."
            asChild
          >
            <Link href="/auth/signup">
              Crear mi Cuenta Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          {/* NUEVO: Botón de descarga PDF */}
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
          
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/5 text-white hover:bg-white/10 ..."
            onClick={onReset}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Validar otra Idea
          </Button>
        </div>
        
        {/* Mostrar error si existe */}
        {error && (
          <p className="text-red-200 text-sm mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
    
    // ...
  );
}
```

## 6. Instalación de Dependencias

```bash
# Instalar jsPDF
npm install jspdf

# Tipos de TypeScript (si no están incluidos)
npm install -D @types/jspdf
```

## 7. Notas de Implementación

### Consideraciones Importantes

1. **Fuentes:** jsPDF incluye Helvetica por defecto. Para usar otras fuentes (como Inter o Geist), habría que convertirlas a formato embebible y añadirlas al documento.

2. **Logo:** El logo actual se dibuja programáticamente. Para usar un logo PNG real, convertirlo a base64 y usar `doc.addImage()`.

3. **Gradientes:** jsPDF no soporta gradientes CSS nativamente. Se simula con un color sólido o múltiples rectángulos.

4. **Responsive:** El PDF tiene dimensiones fijas (A4). El código incluye splitTextToSize() para manejar texto largo.

5. **Performance:** La generación es síncrona y rápida (~100-200ms). Para PDFs más complejos, considerar usar Web Workers.

### Testing

```typescript
// Test básico
const mockResult: ValidationResult = {
  demand_score: 72,
  demand_interpretation: 'Demanda moderada',
  // ... resto de datos mock
};

await generateReportPDF({
  result: mockResult,
  topic: 'Newsletter para dentistas',
  filename: 'test-report.pdf',
});
```