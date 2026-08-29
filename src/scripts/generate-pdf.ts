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
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(slide.title, 1650);
    doc.text(titleLines, 90, 165);

    let currentY = 165 + titleLines.length * 48;

    // Subtitle
    if (content.subtitle) {
      doc.setTextColor(203, 213, 225); // #cbd5e1
      doc.setFontSize(22);
      doc.setFont('helvetica', 'normal');
      const subLines = doc.splitTextToSize(content.subtitle, 1650);
      doc.text(subLines, 90, currentY);
      currentY += subLines.length * 30 + 25;
    } else {
      currentY += 15;
    }

    // Timeline Rendering
    if (content.timeline && content.timeline.length > 0) {
      const colWidth = 550;
      const colGap = 45;

      content.timeline.forEach((step: any, sIdx: number) => {
        const xPos = 90 + sIdx * (colWidth + colGap);
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(xPos, currentY, colWidth, 440, 16, 16, 'FD');

        // Year Badge
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(xPos + 25, currentY + 25, 180, 36, 8, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(step.year || `Passo ${sIdx + 1}`, xPos + 115, currentY + 48, { align: 'center' });

        // Step Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        const stLines = doc.splitTextToSize(step.title, colWidth - 50);
        doc.text(stLines, xPos + 25, currentY + 100);

        // Step Desc
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(17);
        doc.setFont('helvetica', 'normal');
        const sdLines = doc.splitTextToSize(step.desc, colWidth - 50);
        doc.text(sdLines, xPos + 25, currentY + 160);

        // Highlight
        if (step.highlight) {
          doc.setTextColor(56, 189, 248);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(`▸ ${step.highlight}`, xPos + 25, currentY + 390);
        }
      });

      currentY += 470;
    }

    // Comparison Rendering (Mito vs Realidade)
    if (content.comparison) {
      const width = 840;

      // Left Box (Mitos)
      doc.setFillColor(24, 15, 24);
      doc.setDrawColor(136, 19, 55);
      doc.roundedRect(90, currentY, width, 440, 16, 16, 'FD');

      doc.setTextColor(253, 164, 175);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(content.comparison.leftTitle, 120, currentY + 45);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      let leftY = currentY + 95;
      content.comparison.leftItems.forEach((item: string) => {
        const itemLines = doc.splitTextToSize(`• ${item}`, width - 60);
        doc.text(itemLines, 120, leftY);
        leftY += itemLines.length * 28 + 15;
      });

      // Right Box (Realidade)
      doc.setFillColor(6, 30, 26);
      doc.setDrawColor(6, 95, 70);
      doc.roundedRect(990, currentY, width, 440, 16, 16, 'FD');

      doc.setTextColor(110, 231, 183);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(content.comparison.rightTitle, 1020, currentY + 45);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      let rightY = currentY + 95;
      content.comparison.rightItems.forEach((item: string) => {
        const itemLines = doc.splitTextToSize(`✓ ${item}`, width - 60);
        doc.text(itemLines, 1020, rightY);
        rightY += itemLines.length * 28 + 15;
      });

      currentY += 470;
    }

    // Highlights
    if (content.highlights && content.highlights.length > 0) {
      doc.setFontSize(19);
      content.highlights.forEach((h: string) => {
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(90, currentY, 1740, 60, 12, 12, 'FD');

        doc.setTextColor(56, 189, 248);
        doc.setFont('helvetica', 'bold');
        doc.text('[✓]', 120, currentY + 38);

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'normal');
        const hText = doc.splitTextToSize(h, 1620);
        doc.text(hText, 170, currentY + 38);

        currentY += 72;
      });
    }

    // Points
    if (content.points && content.points.length > 0) {
      doc.setFontSize(19);
      content.points.forEach((p: string, pIdx: number) => {
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(90, currentY, 1740, 64, 12, 12, 'FD');

        doc.setFillColor(2, 132, 199);
        doc.roundedRect(120, currentY + 12, 38, 38, 8, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(String(pIdx + 1), 139, currentY + 36, { align: 'center' });

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'normal');
        const pLines = doc.splitTextToSize(p, 1600);
        doc.text(pLines, 180, currentY + 36);

        currentY += 76;
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
        doc.roundedRect(xPos, currentY, cardWidth, 400, 16, 16, 'FD');

        // Card Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        const cTitleLines = doc.splitTextToSize(c.title, cardWidth - 50);
        doc.text(cTitleLines, xPos + 25, currentY + 45);

        // Card Desc
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(17);
        doc.setFont('helvetica', 'normal');
        const cDescLines = doc.splitTextToSize(c.desc, cardWidth - 50);
        doc.text(cDescLines, xPos + 25, currentY + 100);
      });

      currentY += 430;
    }

    // Code
    if (content.code) {
      doc.setFillColor(2, 6, 23);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(90, currentY, 1740, 440, 16, 16, 'FD');

      doc.setTextColor(125, 211, 252);
      doc.setFont('courier', 'normal');
      doc.setFontSize(17);
      const codeLines = doc.splitTextToSize(content.code.snippet, 1680);
      doc.text(codeLines, 120, currentY + 45);

      if (content.code.explanation) {
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(90, currentY + 380, 1740, 60, 0, 0, 'F');
        doc.setTextColor(199, 210, 254);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(content.code.explanation, 120, currentY + 415);
      }

      currentY += 460;
    }

    // TipBox
    if (content.tipBox) {
      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(79, 70, 229);
      doc.roundedRect(90, Math.min(currentY, 860), 1740, 110, 14, 14, 'FD');

      doc.setTextColor(199, 210, 254);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(19);
      doc.text(content.tipBox.title, 120, Math.min(currentY, 860) + 38);

      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(17);
      const tipLines = doc.splitTextToSize(content.tipBox.desc, 1660);
      doc.text(tipLines, 120, Math.min(currentY, 860) + 72);
    }

    // Footer
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(2);
    doc.line(90, 1010, 1830, 1010);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('Stellar Ambassador Workshop 2026 • Soroban Smart Contracts & AI Agents', 90, 1040);
    doc.text('Rede Stellar • 2026', 1830, 1040, { align: 'right' });
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
