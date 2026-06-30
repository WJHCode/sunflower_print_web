const loadHtml2pdf = async () => {
  const module = await import('html2pdf.js');
  return module.default;
};

type PdfExportOptions = {
  paperHeightMm?: number;
  pagebreak?: boolean;
};

export const printElement = (elementId: string, title = '向日葵打印', options: PdfExportOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const paperHeightMm = options.paperHeightMm ?? 296;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768) ||
                   ('ontouchstart' in window);

  if (isMobile) {
    printPdfPreview(element, title, {
      ...options,
      paperHeightMm: Math.min(options.paperHeightMm ?? 296.6, 296.6),
    });
    return;
  }

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.left = '-10000px';
  frame.style.top = '0';
  frame.style.width = '210mm';
  frame.style.height = `${paperHeightMm}mm`;
  frame.style.border = '0';
  frame.setAttribute('aria-hidden', 'true');
  document.body.appendChild(frame);

  const printDocument = frame.contentDocument;
  const printWindow = frame.contentWindow;
  if (!printDocument || !printWindow) {
    frame.remove();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add('exporting');

  printDocument.open();
  printDocument.write(`
    <!doctype html>
    <html>
      <head>
        <base href="${window.location.origin}/">
        <title>${title}</title>
        ${styles}
        <style>
          @page { size: A4 portrait; margin: 0; }
          html, body {
            width: 210mm;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .paper-stack {
            display: block !important;
            gap: 0 !important;
          }
          .paper-container {
            zoom: 1 !important;
            width: 210mm !important;
            height: ${paperHeightMm}mm !important;
            min-height: ${paperHeightMm}mm !important;
            margin: 0 auto !important;
            margin-right: auto !important;
            margin-bottom: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            break-after: auto;
            page-break-after: auto;
          }
          .paper-container.has-next-page {
            break-after: page;
            page-break-after: always;
          }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
    </html>
  `);
  printDocument.close();

  const runPrint = () => {
    printWindow.focus();
    printWindow.print();
    window.setTimeout(() => frame.remove(), 1000);
  };

  if (printDocument.fonts?.ready) {
    printDocument.fonts.ready.then(runPrint).catch(runPrint);
    return;
  }

  window.setTimeout(runPrint, 250);
};

export const getPdfSourceElement = (rootElement: HTMLElement) => {
  const papers = rootElement.querySelectorAll<HTMLElement>('.paper-container');
  return papers.length === 1 ? papers[0] : rootElement;
};

const getPdfOptions = (filename: string, pagebreak = false) => {
  const opt: Record<string, unknown> = {
    margin: 0,
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 1200, windowHeight: 1600, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  };

  opt.pagebreak = { mode: pagebreak ? ['css'] : [] };

  return opt;
};

const createPdfSource = (element: HTMLElement, paperHeightMm = 296) => {
  const pdfHost = document.createElement('div');
  pdfHost.id = 'pdf-export-source';
  pdfHost.setAttribute('aria-hidden', 'true');
  pdfHost.style.position = 'fixed';
  pdfHost.style.left = '-10000px';
  pdfHost.style.top = '0';
  pdfHost.style.width = '210mm';
  pdfHost.style.background = '#fff';
  pdfHost.style.pointerEvents = 'none';
  pdfHost.style.zIndex = '-1';

  const pdfStyle = document.createElement('style');
  pdfStyle.innerHTML = `
    #pdf-export-root:not(.paper-container),
    #pdf-export-root.paper-stack,
    #pdf-export-root .paper-stack {
      display: block !important;
      gap: 0 !important;
      width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      transform: none !important;
    }
    #pdf-export-root.paper-container,
    #pdf-export-root .paper-container {
      transform: none !important;
      zoom: 1 !important;
      width: 210mm !important;
      height: ${paperHeightMm}mm !important;
      min-height: ${paperHeightMm}mm !important;
      margin: 0 !important;
      margin-right: 0 !important;
      margin-bottom: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }
  `;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'pdf-export-root';
  clone.classList.add('exporting');
  normalizePdfSource(clone, paperHeightMm);
  clone.prepend(pdfStyle);
  pdfHost.appendChild(clone);
  document.body.appendChild(pdfHost);

  return {
    sourceElement: clone,
    cleanup: () => pdfHost.remove(),
  };
};

export const createPdfBlobFromElement = async (
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {},
) => {
  const { sourceElement, cleanup } = createPdfSource(element, options.paperHeightMm);

  try {
    const html2pdf = await loadHtml2pdf();
    return await html2pdf()
      .set(getPdfOptions(filename, options.pagebreak))
      .from(sourceElement)
      .outputPdf('blob') as Blob;
  } finally {
    cleanup();
  }
};

export const savePdfFromElement = async (
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {},
) => {
  const { sourceElement, cleanup } = createPdfSource(element, options.paperHeightMm);

  try {
    const html2pdf = await loadHtml2pdf();
    await html2pdf()
      .set(getPdfOptions(filename, options.pagebreak))
      .from(sourceElement)
      .save();
  } finally {
    cleanup();
  }
};

const printPdfPreview = (element: HTMLElement, title: string, options: PdfExportOptions = {}) => {
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write('<!doctype html><title>正在生成打印预览</title><p style="font:16px system-ui;padding:24px;">正在生成打印预览...</p>');
    previewWindow.document.close();
  }

  const fallbackDownload = (blob: Blob) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const runPrint = async () => {
    try {
      const blob = await createPdfBlobFromElement(element, `${title}.pdf`, {
        ...options,
      });
      const url = URL.createObjectURL(blob);

      if (previewWindow) {
        let printRequested = false;
        const requestSystemPrint = () => {
          if (printRequested || previewWindow.closed) return;
          printRequested = true;
          previewWindow.focus();
          previewWindow.print();
        };

        previewWindow.addEventListener('load', () => {
          window.setTimeout(requestSystemPrint, 400);
        }, { once: true });
        previewWindow.location.replace(url);

        // Some mobile PDF viewers do not dispatch a window load event for Blob URLs.
        window.setTimeout(requestSystemPrint, 1500);
        window.setTimeout(() => URL.revokeObjectURL(url), 300000);
      } else {
        fallbackDownload(blob);
      }
    } catch (error) {
      previewWindow?.close();
      console.error('Failed to generate print preview PDF.', error);
    }
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(runPrint).catch(runPrint);
    return;
  }

  window.setTimeout(runPrint, 300);
};

const normalizePdfSource = (root: HTMLElement, paperHeightMm: number) => {
  const setImportant = (target: HTMLElement, property: string, value: string) => {
    target.style.setProperty(property, value, 'important');
  };

  if (!root.matches('.paper-container')) {
    setImportant(root, 'display', 'block');
    setImportant(root, 'padding', '0');
  }
  setImportant(root, 'width', '210mm');
  setImportant(root, 'margin', '0');
  setImportant(root, 'margin-right', '0');
  setImportant(root, 'margin-bottom', '0');
  setImportant(root, 'gap', '0');
  setImportant(root, 'transform', 'none');

  root.querySelectorAll<HTMLElement>('.paper-stack').forEach((stack) => {
    setImportant(stack, 'display', 'block');
    setImportant(stack, 'width', '210mm');
    setImportant(stack, 'margin', '0');
    setImportant(stack, 'margin-right', '0');
    setImportant(stack, 'margin-bottom', '0');
    setImportant(stack, 'padding', '0');
    setImportant(stack, 'gap', '0');
    setImportant(stack, 'transform', 'none');
  });

  const papers = root.matches('.paper-container')
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>('.paper-container'));

  papers.forEach((paper) => {
    setImportant(paper, 'width', '210mm');
    setImportant(paper, 'height', `${paperHeightMm}mm`);
    setImportant(paper, 'min-height', `${paperHeightMm}mm`);
    setImportant(paper, 'margin', '0');
    setImportant(paper, 'margin-right', '0');
    setImportant(paper, 'margin-bottom', '0');
    setImportant(paper, 'box-shadow', 'none');
    setImportant(paper, 'border-radius', '0');
    setImportant(paper, 'overflow', 'hidden');
    setImportant(paper, 'box-sizing', 'border-box');
    setImportant(paper, 'transform', 'none');
    setImportant(paper, 'transform-origin', 'top left');
    setImportant(paper, 'zoom', '1');
    setImportant(paper, 'break-after', paper.classList.contains('has-next-page') ? 'page' : 'auto');
    setImportant(paper, 'page-break-after', paper.classList.contains('has-next-page') ? 'always' : 'auto');
  });
};
