// src/lib/pdf/pdf-assets.ts
import jsPDF from 'jspdf';

// Logo de Valio.pro en base64 (reemplazar con el logo real si es necesario)
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
    doc.setLineWidth(1); // Reducir un poco el grosor para que se vea más fino
    doc.circle(x + size / 2, y + size / 2, size / 2, 'S');

    // Checkmark
    doc.line(x + size * 0.25, y + size * 0.5, x + size * 0.45, y + size * 0.7);
    doc.line(x + size * 0.45, y + size * 0.7, x + size * 0.75, y + size * 0.3);
}

export function drawAlertIcon(doc: jsPDF, x: number, y: number, size: number = 16): void {
    doc.setDrawColor('#f59e0b');
    doc.setFillColor('#f59e0b');
    doc.setLineWidth(1);

    // Triángulo
    doc.triangle(
        x + size / 2, y,
        x + size, y + size,
        x, y + size,
        'S'
    );

    // Exclamación
    doc.line(x + size / 2, y + size * 0.35, x + size / 2, y + size * 0.6);
    doc.circle(x + size / 2, y + size * 0.75, 0.5, 'F');
}

export function drawXIcon(doc: jsPDF, x: number, y: number, size: number = 16): void {
    doc.setDrawColor('#f43f5e');
    doc.setLineWidth(1);
    doc.circle(x + size / 2, y + size / 2, size / 2, 'S');

    // X
    const padding = size * 0.3;
    doc.line(x + padding, y + padding, x + size - padding, y + size - padding);
    doc.line(x + size - padding, y + padding, x + padding, y + size - padding);
}
