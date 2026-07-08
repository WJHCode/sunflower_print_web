const loadHtml2pdf = async () => {
  const module = await import('html2pdf.js');
  return module.default;
};

const loadHtml2canvas = async () => {
  const module = await import('html2canvas');
  return module.default;
};

type PdfExportOptions = {
  paperHeightMm?: number;
  pagebreak?: boolean;
};

const isMobileDevice = () => (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  window.innerWidth <= 768 ||
  'ontouchstart' in window
);

const normalizePngFilename = (filename: string) => (filename.endsWith('.png') ? filename : `${filename}.png`);

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const canvasToPngBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
      return;
    }
    reject(new Error('Failed to create PNG image.'));
  }, 'image/png');
});

type FileShareData = ShareData & {
  files: File[];
};

type FileShareNavigator = Navigator & {
  canShare?: (data: FileShareData) => boolean;
  share?: (data: FileShareData) => Promise<void>;
};

type ShareImageResult = {
  shared: boolean;
  message?: string;
};

const shareImageFile = async (blob: Blob, filename: string) => {
  if (!isMobileDevice()) {
    return { shared: false, message: '当前设备不是移动端。' };
  }

  if (!window.isSecureContext) {
    return { shared: false, message: '当前页面不是 HTTPS 安全环境，iOS 不允许网页调用系统分享。' };
  }

  const shareNavigator = navigator as FileShareNavigator;
  if (!shareNavigator.share) {
    return { shared: false, message: '当前浏览器不支持系统分享，请用 Safari 打开后再试。' };
  }

  const imageFile = new File([blob], filename, { type: 'image/png' });
  const shareData: FileShareData = {
    files: [imageFile],
    title: filename,
  };

  if (shareNavigator.canShare) {
    const canShareFiles = shareNavigator.canShare({ files: [imageFile] });
    if (!canShareFiles) {
      return { shared: false, message: '当前浏览器支持分享，但不支持分享图片文件。请长按图片保存，或用 Safari 打开。' };
    }
  }

  try {
    await shareNavigator.share(shareData);
    return { shared: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { shared: false, message: '已取消系统分享。' };
    }
    console.warn('Failed to share PNG image.', error);
    return { shared: false, message: '系统分享面板打开失败，请长按图片保存，或换 Safari/系统浏览器打开后再试。' };
  }
};

const showMobileImageSaveDialog = (blob: Blob, filename: string) => new Promise<void>((resolve) => {
  const previewUrl = URL.createObjectURL(blob);
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '18px';
  overlay.style.background = 'rgba(20, 27, 24, 0.58)';

  const panel = document.createElement('div');
  panel.style.width = 'min(420px, 100%)';
  panel.style.maxHeight = '92vh';
  panel.style.overflow = 'auto';
  panel.style.background = '#fff';
  panel.style.borderRadius = '16px';
  panel.style.padding = '16px';
  panel.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.24)';
  panel.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const title = document.createElement('h3');
  title.textContent = '图片已生成';
  title.style.margin = '0 0 8px';
  title.style.fontSize = '18px';
  title.style.color = '#1f2a24';

  const tip = document.createElement('p');
  tip.textContent = '点击“保存到相册”后，在系统分享面板里选择“存储图像”或“保存图片”。';
  tip.style.margin = '0 0 12px';
  tip.style.fontSize = '14px';
  tip.style.lineHeight = '1.5';
  tip.style.color = '#52635a';

  const preview = document.createElement('img');
  preview.src = previewUrl;
  preview.alt = filename;
  preview.style.display = 'block';
  preview.style.width = '100%';
  preview.style.maxHeight = '48vh';
  preview.style.objectFit = 'contain';
  preview.style.background = '#f6f4ef';
  preview.style.border = '1px solid #e7e1d4';
  preview.style.borderRadius = '10px';

  const status = document.createElement('p');
  status.style.minHeight = '20px';
  status.style.margin = '10px 0 0';
  status.style.fontSize = '13px';
  status.style.lineHeight = '1.45';
  status.style.color = '#6b7a70';

  const actions = document.createElement('div');
  actions.style.display = 'grid';
  actions.style.gridTemplateColumns = '1fr 1fr';
  actions.style.gap = '10px';
  actions.style.marginTop = '14px';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = '保存到相册';
  saveButton.style.height = '42px';
  saveButton.style.border = '0';
  saveButton.style.borderRadius = '8px';
  saveButton.style.background = '#2f7d46';
  saveButton.style.color = '#fff';
  saveButton.style.fontSize = '15px';
  saveButton.style.fontWeight = '600';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '关闭';
  closeButton.style.height = '42px';
  closeButton.style.border = '1px solid #d8ddd8';
  closeButton.style.borderRadius = '8px';
  closeButton.style.background = '#fff';
  closeButton.style.color = '#2b3b31';
  closeButton.style.fontSize = '15px';

  const cleanup = () => {
    overlay.remove();
    URL.revokeObjectURL(previewUrl);
    resolve();
  };

  saveButton.addEventListener('click', async () => {
    saveButton.disabled = true;
    status.textContent = '正在打开系统分享面板...';
    const result: ShareImageResult = await shareImageFile(blob, filename);
    if (result.shared) {
      cleanup();
      return;
    }
    saveButton.disabled = false;
    status.textContent = result.message ?? '如果没有弹出分享面板，请长按上方图片保存，或换 Safari/系统浏览器打开后再试。';
  });

  closeButton.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });

  actions.append(saveButton, closeButton);
  panel.append(title, tip, preview, status, actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
});

export const printElement = (elementId: string, title = '向日葵打印', options: PdfExportOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const paperHeightMm = options.paperHeightMm ?? 296;

  if (isMobileDevice()) {
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

export const saveImageFromElement = async (
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {},
) => {
  const { sourceElement, cleanup } = createPdfSource(element, options.paperHeightMm);
  const pngFilename = normalizePngFilename(filename);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    const html2canvas = await loadHtml2canvas();
    const canvas = await html2canvas(sourceElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      windowWidth: 1200,
      windowHeight: Math.max(sourceElement.scrollHeight, 1600),
      scrollX: 0,
      scrollY: 0,
    });
    const imageBlob = await canvasToPngBlob(canvas);
    if (isMobileDevice()) {
      await showMobileImageSaveDialog(imageBlob, pngFilename);
    } else {
      downloadBlob(imageBlob, pngFilename);
    }
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
