import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Load default slides data from session service
import { getOrCreateDefaultSession } from '../lib/services/session';

async function generatePdfFile() {
  const { slides } = getOrCreateDefaultSession();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
  });

  slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage([1920, 1080], 'landscape');
    }

    const content = JSON.parse(slide.content);

    // Dark Background (#020617)
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, 1920, 1080, 'F');

    // Subtle Top Accent Line (#4f46e5)
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 1920, 12, 'F');

    // Header Bar
    doc.setTextColor(56, 189, 248); // #38bdf8
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const categoryText = `${(content.category || 'WORKSHOP').toUpperCase()}  •  SLIDE ${index + 1} DE ${slides.length}`;
    doc.text(categoryText, 90, 80);

    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('Stellar Network Ambassador Workshop 2026', 1830, 80, { align: 'right' });

    // Divider
    doc.setDrawColor(30, 41, 59); // #1e293b
    doc.setLineWidth(2);
    doc.line(90, 105, 1830, 105);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(44);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(slide.title, 1650);
    doc.text(titleLines, 90, 170);

    let currentY = 170 + titleLines.length * 50;

    // Subtitle
    if (content.subtitle) {
      doc.setTextColor(203, 213, 225); // #cbd5e1
      doc.setFontSize(24);
      doc.setFont('helvetica', 'normal');
      const subLines = doc.splitTextToSize(content.subtitle, 1650);
      doc.text(subLines, 90, currentY);
      currentY += subLines.length * 32 + 30;
    } else {
      currentY += 20;
    }

    // Highlights
    if (content.highlights && content.highlights.length > 0) {
      doc.setFontSize(20);
      content.highlights.forEach((h: string) => {
        // Card Box
        doc.setFillColor(15, 23, 42); // #0f172a
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(90, currentY, 1740, 64, 12, 12, 'FD');

        doc.setTextColor(56, 189, 248);
        doc.setFont('helvetica', 'bold');
        doc.text('[✓]', 120, currentY + 40);

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'normal');
        const hText = doc.splitTextToSize(h, 1620);
        doc.text(hText, 170, currentY + 40);

        currentY += 78;
      });
    }

    // Points
    if (content.points && content.points.length > 0) {
      doc.setFontSize(20);
      content.points.forEach((p: string, pIdx: number) => {
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(90, currentY, 1740, 68, 12, 12, 'FD');

        doc.setFillColor(2, 132, 199); // #0284c7
        doc.roundedRect(120, currentY + 14, 40, 40, 8, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(String(pIdx + 1), 140, currentY + 40, { align: 'center' });

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'normal');
        const pLines = doc.splitTextToSize(p, 1600);
        doc.text(pLines, 180, currentY + 40);

        currentY += 82;
      });
    }

    // Cards
    if (content.cards && content.cards.length > 0) {
      const cardWidth = 550;
      const cardGap = 45;

      content.cards.forEach((c: any, cIdx: number) => {
        const xPos = 90 + cIdx * (cardWidth + cardGap);
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(xPos, currentY, cardWidth, 420, 16, 16, 'FD');

        // Card Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const cTitleLines = doc.splitTextToSize(c.title, cardWidth - 50);
        doc.text(cTitleLines, xPos + 25, currentY + 45);

        // Card Desc
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        const cDescLines = doc.splitTextToSize(c.desc, cardWidth - 50);
        doc.text(cDescLines, xPos + 25, currentY + 100);
      });
    }

    // Code
    if (content.code) {
      doc.setFillColor(2, 6, 23);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(90, currentY, 1740, 480, 16, 16, 'FD');

      doc.setTextColor(125, 211, 252); // #7dd3fc
      doc.setFont('courier', 'normal');
      doc.setFontSize(18);
      const codeLines = doc.splitTextToSize(content.code.snippet, 1680);
      doc.text(codeLines, 120, currentY + 50);
    }

    // Footer
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(2);
    doc.line(90, 1000, 1830, 1000);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('Introdução a Blockchain, Web3 & Soroban Smart Contracts', 90, 1035);
    doc.text('Stellar Network • 2026', 1830, 1035, { align: 'right' });
  });

  const outputDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'slides_stellar_workshop.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(pdfPath, pdfBuffer);

  console.log(`[PDF Generator] Successfully created ${pdfPath}`);
}

generatePdfFile().catch(console.error);
