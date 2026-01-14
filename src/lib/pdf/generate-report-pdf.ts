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
    const { margin, headerHeight } = PDF_CONFIG;
    const contentWidth = pageWidth - (margin * 2);
    const contentStartY = margin + headerHeight + 5;

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
    renderFooter(doc, pageWidth, pageHeight, margin, 1, 4);

    // === PÁGINA 2: Análisis de Demanda ===
    doc.addPage();
    renderHeader(doc, pageWidth, margin);
    renderDemandAnalysisPage(doc, result, margin, contentWidth, contentStartY);
    renderFooter(doc, pageWidth, pageHeight, margin, 2, 4);

    // === PÁGINA 3: Insights del Mercado ===
    doc.addPage();
    renderHeader(doc, pageWidth, margin);
    renderMarketInsightsPage(doc, result, margin, contentWidth, contentStartY);
    renderFooter(doc, pageWidth, pageHeight, margin, 3, 4);

    // === PÁGINA 4: Ángulos de Contenido ===
    doc.addPage();
    renderHeader(doc, pageWidth, margin);
    renderContentAnglesPage(doc, result, margin, contentWidth, contentStartY);
    renderFooter(doc, pageWidth, pageHeight, margin, 4, 4);

    // Guardar el PDF
    doc.save(filename);
}

// ============================================
// HEADER & FOOTER
// ============================================

function renderHeader(doc: jsPDF, pageWidth: number, margin: number): void {
    const headerHeight = PDF_CONFIG.headerHeight;

    // Fondo con color azul primario
    doc.setFillColor(VALIO_COLORS.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Línea de acento cyan en la parte inferior del header
    doc.setFillColor(VALIO_COLORS.accent);
    doc.rect(0, headerHeight - 2, pageWidth, 2, 'F');

    // Logo (programático)
    drawValioLogo(doc, margin, 8, 6);

    doc.setTextColor(VALIO_COLORS.white);
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
    doc.setLineWidth(0.2);
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
    let y = startY + 10;

    // Título de sección centralizado
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
    const verdictCardHeight = 85;

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
    let razonamientoY = y + 45;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.small);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('Razonamiento:', margin + 15, razonamientoY);

    razonamientoY += 2;
    doc.setFont('helvetica', 'normal');
    result.strategic_recommendation.reasoning.forEach((reason, index) => {
        if (index < 4) { // Limitar a 4 razones para evitar desbordamiento
            razonamientoY += 8;
            doc.setFillColor(verdictConfig.color);
            doc.circle(margin + 20, razonamientoY - 1, 1, 'F');

            const reasonLines = doc.splitTextToSize(reason, contentWidth - 30);
            doc.setTextColor(VALIO_COLORS.textSecondary);
            doc.text(reasonLines[0], margin + 25, razonamientoY);
        }
    });

    y += verdictCardHeight + 15;

    // Target fit y condiciones de éxito
    const infoBoxWidth = (contentWidth - 10) / 2;

    // Target fit
    doc.setFillColor(VALIO_COLORS.white);
    doc.setDrawColor(VALIO_COLORS.border);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, y, infoBoxWidth, 45, 3, 3, 'FD');

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
    doc.setFillColor(VALIO_COLORS.white);
    doc.roundedRect(margin + infoBoxWidth + 10, y, infoBoxWidth, 45, 3, 3, 'FD');

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
    let y = startY + 10;

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading1);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('ANÁLISIS DE DEMANDA', margin, y);

    y += 15;

    // Card de demand score
    doc.setFillColor(VALIO_COLORS.white);
    doc.setDrawColor(VALIO_COLORS.primary);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 55, 4, 4, 'FD');

    // Borde izquierdo azul
    doc.setFillColor(VALIO_COLORS.primary);
    doc.rect(margin, y, 4, 55, 'F');

    // Score grande
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text(`${result.demand_score}`, margin + 15, y + 28);

    doc.setFontSize(16);
    doc.setTextColor(VALIO_COLORS.textMuted);
    doc.text('/100', margin + 15 + doc.getTextWidth(`${result.demand_score}`) + 2, y + 28);

    // Barra de progreso
    const barX = margin + 15;
    const barY = y + 36;
    const barWidth = 60;
    const barHeight = 4;

    doc.setFillColor(VALIO_COLORS.bgLight);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

    const fillWidth = (result.demand_score / 100) * barWidth;
    doc.setFillColor(VALIO_COLORS.primary);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');

    // Interpretación badge
    doc.setFillColor(VALIO_COLORS.bgLight);
    doc.roundedRect(margin + contentWidth - 55, y + 10, 45, 12, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.caption);
    doc.setTextColor(VALIO_COLORS.primary);
    doc.text(result.demand_interpretation.toUpperCase(), margin + contentWidth - 32.5, y + 18, { align: 'center' });

    // Summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(VALIO_FONTS.body);
    doc.setTextColor(VALIO_COLORS.textSecondary);
    const summaryLines = doc.splitTextToSize(result.demand_summary, contentWidth - 85);
    doc.text(summaryLines, margin + 75, y + 28);

    y += 70;

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
        doc.text(signal.label.toUpperCase(), x + signalBoxWidth / 2, y + 12, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(VALIO_FONTS.heading3);
        doc.setTextColor(VALIO_COLORS.textPrimary);

        // Split value if too long
        const valLines = doc.splitTextToSize(signal.value, signalBoxWidth - 10);
        doc.text(valLines[0], x + signalBoxWidth / 2, y + 25, { align: 'center' });
    });

    y += 55;

    // Impacto de negocio
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading2);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('IMPACTO DE NEGOCIO', margin, y);

    y += 12;

    doc.setFillColor(VALIO_COLORS.white);
    doc.setDrawColor(VALIO_COLORS.border);
    doc.roundedRect(margin, y, contentWidth, 60, 4, 4, 'FD');

    const businessItems = [
        { label: 'Objetivo principal', value: result.business_impact.primary_objective.toUpperCase() },
        { label: 'Potencial monetización', value: result.business_impact.monetization_potential },
        { label: 'Riesgos comerciales', value: result.business_impact.commercial_risks },
    ];

    let itemY = y + 15;
    businessItems.forEach((item) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(VALIO_FONTS.small);
        doc.setTextColor(VALIO_COLORS.textMuted);
        doc.text(`${item.label}:`, margin + 10, itemY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(VALIO_FONTS.small);
        doc.setTextColor(VALIO_COLORS.textPrimary);

        const maxValWidth = contentWidth - 60;
        const valLines = doc.splitTextToSize(item.value, maxValWidth);
        doc.text(valLines[0], margin + 50, itemY);

        itemY += 15;
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
    let y = startY + 10;

    // Pain Points
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading2);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('DOLORES Y FRUSTRACIONES DETECTADOS', margin, y);

    y += 10;

    const painPointsHeight = Math.min(result.pain_points.length * 10 + 10, 65);
    doc.setFillColor(VALIO_COLORS.white);
    doc.setDrawColor(VALIO_COLORS.border);
    doc.roundedRect(margin, y, contentWidth, painPointsHeight, 4, 4, 'FD');

    doc.setFillColor('#ef4444');
    doc.rect(margin, y, 3, painPointsHeight, 'F');

    let itemY = y + 12;
    result.pain_points.slice(0, 5).forEach((point) => {
        doc.setFillColor('#ef4444');
        doc.circle(margin + 10, itemY - 1, 0.8, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(VALIO_FONTS.body);
        doc.setTextColor(VALIO_COLORS.textSecondary);

        const lines = doc.splitTextToSize(point, contentWidth - 20);
        doc.text(lines[0], margin + 15, itemY);
        itemY += 10;
    });

    y += painPointsHeight + 15;

    // Questions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading2);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('PREGUNTAS FRECUENTES DE LA AUDIENCIA', margin, y);

    y += 10;

    const questionsHeight = Math.min(result.questions.length * 10 + 10, 65);
    doc.setFillColor(VALIO_COLORS.white);
    doc.roundedRect(margin, y, contentWidth, questionsHeight, 4, 4, 'FD');

    doc.setFillColor('#f59e0b');
    doc.rect(margin, y, 3, questionsHeight, 'F');

    itemY = y + 12;
    result.questions.slice(0, 5).forEach((question) => {
        doc.setFillColor('#f59e0b');
        doc.circle(margin + 10, itemY - 1, 0.8, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(VALIO_FONTS.body);
        doc.setTextColor(VALIO_COLORS.textSecondary);

        const lines = doc.splitTextToSize(question, contentWidth - 20);
        doc.text(lines[0], margin + 15, itemY);
        itemY += 10;
    });

    y += questionsHeight + 15;

    // Not Recommended If
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading2);
    doc.setTextColor(VALIO_COLORS.verdictReconsider);
    doc.text('⚠️ NO RECOMENDADO SI...', margin, y);

    y += 10;

    const notRecHeight = Math.min(result.not_recommended_if.length * 10 + 10, 55);
    doc.setFillColor(VALIO_COLORS.verdictReconsiderBg);
    doc.roundedRect(margin, y, contentWidth, notRecHeight, 4, 4, 'F');

    itemY = y + 12;
    result.not_recommended_if.slice(0, 4).forEach((item) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(VALIO_FONTS.body);
        doc.setTextColor(VALIO_COLORS.verdictReconsider);
        doc.text(`✕  ${item}`, margin + 10, itemY);
        itemY += 10;
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
    let y = startY + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading1);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text('ÁNGULOS DE CONTENIDO RECOMENDADOS', margin, y);

    y += 15;

    result.content_angles.slice(0, 3).forEach((angle, index) => {
        const cardHeight = 48;

        doc.setFillColor(VALIO_COLORS.white);
        doc.setDrawColor(VALIO_COLORS.border);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 4, 4, 'FD');

        doc.setFillColor(VALIO_COLORS.verdictCreate);
        doc.rect(margin, y, 3, cardHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(VALIO_FONTS.heading3);
        doc.setTextColor(VALIO_COLORS.textPrimary);
        doc.text(`${index + 1}. ${angle.format}`, margin + 10, y + 10);

        // Badge complejidad
        const badgeX = margin + contentWidth - 35;
        const badgeColor = angle.complexity === 'básico' ? VALIO_COLORS.verdictCreateBg : VALIO_COLORS.verdictPilotBg;
        const badgeTextColor = angle.complexity === 'básico' ? VALIO_COLORS.verdictCreate : VALIO_COLORS.verdictPilot;

        doc.setFillColor(badgeColor);
        doc.roundedRect(badgeX, y + 4, 25, 8, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(badgeTextColor);
        doc.text(angle.complexity.toUpperCase(), badgeX + 12.5, y + 9.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(VALIO_FONTS.small);
        doc.setTextColor(VALIO_COLORS.textMuted);
        doc.text('HOOK:', margin + 10, y + 20);

        doc.setFont('helvetica', 'italic');
        doc.setTextColor(VALIO_COLORS.textPrimary);
        const hookLines = doc.splitTextToSize(`"${angle.hook}"`, contentWidth - 30);
        doc.text(hookLines[0], margin + 22, y + 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(VALIO_FONTS.small);
        doc.setTextColor(VALIO_COLORS.textSecondary);
        const descLines = doc.splitTextToSize(angle.description, contentWidth - 20);
        doc.text(descLines.slice(0, 2), margin + 10, y + 32);

        y += cardHeight + 8;
    });

    y += 10;

    // Confidence Score
    doc.setFillColor(VALIO_COLORS.bgLight);
    doc.roundedRect(margin, y, contentWidth, 30, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.heading3);
    doc.setTextColor(VALIO_COLORS.textPrimary);
    doc.text(`NIVEL DE CONFIANZA: ${result.confidence_score}%`, margin + contentWidth / 2, y + 12, { align: 'center' });

    const confBarX = margin + 30;
    const confBarY = y + 18;
    const confBarWidth = contentWidth - 60;
    const confBarHeight = 3;

    doc.setFillColor(VALIO_COLORS.border);
    doc.roundedRect(confBarX, confBarY, confBarWidth, confBarHeight, 1.5, 1.5, 'F');

    const confFillWidth = (result.confidence_score / 100) * confBarWidth;
    doc.setFillColor(VALIO_COLORS.primary);
    doc.roundedRect(confBarX, confBarY, confFillWidth, confBarHeight, 1.5, 1.5, 'F');

    y += 45;

    // Final CTA
    doc.setFillColor(VALIO_COLORS.primary);
    doc.roundedRect(margin, y, contentWidth, 20, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(VALIO_FONTS.body);
    doc.setTextColor(VALIO_COLORS.white);
    doc.text('¿Necesitas más validaciones? Visita valio.pro', margin + contentWidth / 2, y + 12, { align: 'center' });
}
