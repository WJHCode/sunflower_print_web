const loadHtml2pdf = async () => {
  const module = await import('html2pdf.js');
  return module.default;
};

export const printElement = (elementId: string, title = '向日葵打印') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768) || 
                   ('ontouchstart' in window);

  if (isMobile) {
    printMobilePdfPreview(element, title);
    return;
  }

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
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
            height: 296mm !important;
            min-height: 0 !important;
            margin: 0 auto !important;
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

type PdfExportOptions = {
  normalizeForMobile?: boolean;
  pagebreak?: boolean;
};

const getPdfOptions = (filename: string, pagebreak = false) => {
  const opt: Record<string, unknown> = {
    margin: 0,
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  };

  if (pagebreak) {
    opt.pagebreak = { mode: ['css'] };
  }

  return opt;
};

const createPdfSource = (element: HTMLElement, normalizeForMobile = false) => {
  if (!normalizeForMobile) {
    element.classList.add('exporting');
    return {
      sourceElement: getPdfSourceElement(element),
      cleanup: () => element.classList.remove('exporting'),
    };
  }

  const pdfHost = document.createElement('div');
  pdfHost.id = 'mobile-pdf-preview-source';
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
    #mobile-pdf-preview-source,
    #mobile-pdf-preview-source .paper-stack {
      display: block !important;
      gap: 0 !important;
    }
    #mobile-pdf-preview-source .paper-container {
      transform: none !important;
      zoom: 1 !important;
      width: 210mm !important;
      height: 296mm !important;
      min-height: 0 !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }
  `;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add('exporting');
  normalizeMobilePdfSource(clone);
  pdfHost.appendChild(pdfStyle);
  pdfHost.appendChild(clone);
  document.body.appendChild(pdfHost);

  return {
    sourceElement: getPdfSourceElement(clone),
    cleanup: () => pdfHost.remove(),
  };
};

export const createPdfBlobFromElement = async (
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {},
) => {
  const { sourceElement, cleanup } = createPdfSource(element, options.normalizeForMobile);

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
  const { sourceElement, cleanup } = createPdfSource(element, options.normalizeForMobile);

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

const printMobilePdfPreview = (element: HTMLElement, title: string) => {
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
      const blob = await createPdfBlobFromElement(element, `${title}.pdf`, { normalizeForMobile: true });
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
      console.error('Failed to generate mobile print preview PDF.', error);
    }
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(runPrint).catch(runPrint);
    return;
  }

  window.setTimeout(runPrint, 300);
};

const normalizeMobilePdfSource = (root: HTMLElement) => {
  root.style.display = 'block';
  root.style.width = '210mm';
  root.style.margin = '0';
  root.style.padding = '0';
  root.style.gap = '0';
  root.style.transform = 'none';

  root.querySelectorAll<HTMLElement>('.paper-stack').forEach((stack) => {
    stack.style.display = 'block';
    stack.style.width = '210mm';
    stack.style.margin = '0';
    stack.style.padding = '0';
    stack.style.gap = '0';
    stack.style.transform = 'none';
  });

  const papers = root.matches('.paper-container')
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>('.paper-container'));

  papers.forEach((paper) => {
    paper.style.display = 'block';
    paper.style.width = '210mm';
    paper.style.height = '296mm';
    paper.style.minHeight = '0';
    paper.style.margin = '0 auto';
    paper.style.padding = paper.style.padding || '';
    paper.style.boxShadow = 'none';
    paper.style.borderRadius = '0';
    paper.style.overflow = 'hidden';
    paper.style.boxSizing = 'border-box';
    paper.style.transform = 'none';
    paper.style.transformOrigin = 'top left';
    paper.style.zoom = '1';
  });
};
