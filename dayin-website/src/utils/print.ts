export const printElement = (elementId: string, title = '向日葵打印') => {
  const element = document.getElementById(elementId);
  if (!element) return;

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
