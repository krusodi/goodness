/**
 * Utility to export HTML content / DOM elements directly to Microsoft Word (.doc)
 * Compatible with Microsoft Word Desktop & Online, LibreOffice Writer, and Google Docs
 */

export interface ExportWordOptions {
  filename?: string;
  title?: string;
  isLandscape?: boolean;
}

export function exportElementToWord(
  elementOrId: HTMLElement | string,
  filename: string,
  options?: ExportWordOptions
): boolean {
  try {
    const container =
      typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (!container) {
      console.warn('Word Export Target Element Not Found:', elementOrId);
      return false;
    }

    // Clone element to strip out no-print or interactive UI controls
    const clone = container.cloneNode(true) as HTMLElement;

    // Remove no-print / interactive controls
    const noPrintElements = clone.querySelectorAll('.no-print, button, input, select');
    noPrintElements.forEach((el) => {
      // Keep signature contents if inside
      if (el.tagName.toLowerCase() === 'button') {
        el.remove();
      }
    });

    // Format tables specifically for Word
    const tables = clone.querySelectorAll('table');
    tables.forEach((table) => {
      table.setAttribute('border', '1');
      table.setAttribute('cellspacing', '0');
      table.setAttribute('cellpadding', '6');
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.marginTop = '12px';
      (table as HTMLElement).style.marginBottom = '12px';
    });

    // Format table header & cells
    const ths = clone.querySelectorAll('th');
    ths.forEach((th) => {
      (th as HTMLElement).style.backgroundColor = '#f1f5f9';
      (th as HTMLElement).style.color = '#0f172a';
      (th as HTMLElement).style.borderColor = '#94a3b8';
      (th as HTMLElement).style.fontWeight = 'bold';
    });

    const tds = clone.querySelectorAll('td');
    tds.forEach((td) => {
      (td as HTMLElement).style.borderColor = '#cbd5e1';
    });

    const isLandscape = options?.isLandscape ?? true;
    const orientationCss = isLandscape
      ? '@page Section1 { size: 11.69in 8.27in; mso-page-orientation: landscape; margin: 0.6in 0.5in 0.6in 0.5in; }'
      : '@page Section1 { size: 8.27in 11.69in; mso-page-orientation: portrait; margin: 0.6in 0.6in 0.6in 0.6in; }';

    const cleanFilename = filename.replace(/[/\\?%*:|"<>]/g, '_');

    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${options?.title || cleanFilename}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          ${orientationCss}
          div.Section1 { page: Section1; }
          body {
            font-family: 'TH Sarabun New', 'Sarabun', 'Angsana New', 'Cordia New', sans-serif;
            font-size: 14pt;
            color: #1e293b;
            line-height: 1.4;
          }
          h1, h2, h3, h4 {
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
            color: #0f172a;
            margin-top: 8px;
            margin-bottom: 4px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10px;
            margin-bottom: 15px;
          }
          th, td {
            border: 1px solid #94a3b8;
            padding: 5px 8px;
            font-size: 12pt;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .grid { display: table; width: 100%; }
          .grid > div { display: table-cell; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${clone.innerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlString], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = cleanFilename.endsWith('.doc')
      ? cleanFilename
      : `${cleanFilename}.doc`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch (error) {
    console.error('Failed to export to Word:', error);
    return false;
  }
}
