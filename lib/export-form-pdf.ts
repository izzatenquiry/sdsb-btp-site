/**
 * Renders the live DOM preview element (#printable-form-sheet) into an exact 1:1 A4 PDF
 * using the browser's native Blink/WebKit SVG <foreignObject> rasterizer so that fonts,
 * baselines, borders, flexbox/table layouts, and checkboxes match the on-screen preview 100%.
 */
export async function exportElementToA4Pdf(
  sourceEl: HTMLElement,
  filename: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const rect = sourceEl.getBoundingClientRect();
  const width = Math.ceil(rect.width) || 820;
  const height = Math.ceil(Math.max(rect.height, sourceEl.scrollHeight)) || 1160;

  async function imageToDataUrl(imgEl: HTMLImageElement): Promise<string> {
    const src = imgEl.currentSrc || imgEl.src;
    if (!src || src.startsWith("data:")) return src;
    try {
      const res = await fetch(src, { cache: "force-cache" });
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      try {
        const c = document.createElement("canvas");
        c.width = imgEl.naturalWidth || imgEl.width || 100;
        c.height = imgEl.naturalHeight || imgEl.height || 50;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgEl, 0, 0);
          return c.toDataURL("image/png");
        }
      } catch {
        // ignore
      }
      return src;
    }
  }

  function cloneWithComputedStyles(origNode: Node): Node {
    const clone = origNode.cloneNode(false);
    if (origNode.nodeType === Node.ELEMENT_NODE) {
      const origEl = origNode as HTMLElement;
      const cloneEl = clone as HTMLElement;
      const cs = window.getComputedStyle(origEl);

      let cssText = "";
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i];
        // Skip animations/transitions to ensure static snapshot
        if (prop.startsWith("transition") || prop.startsWith("animation")) continue;
        const val = cs.getPropertyValue(prop);
        if (val) {
          cssText += `${prop}:${val};`;
        }
      }
      cloneEl.setAttribute("style", cssText);
      cloneEl.removeAttribute("class");

      if (origEl instanceof HTMLInputElement) {
        const cInp = clone as HTMLInputElement;
        if (origEl.type === "checkbox" || origEl.type === "radio") {
          cInp.checked = origEl.checked;
          if (origEl.checked) {
            cInp.setAttribute("checked", "checked");
          } else {
            cInp.removeAttribute("checked");
          }
        } else {
          cInp.value = origEl.value;
          cInp.setAttribute("value", origEl.value);
        }
      } else if (origEl instanceof HTMLTextAreaElement) {
        const cTa = clone as HTMLTextAreaElement;
        cTa.value = origEl.value;
        cTa.textContent = origEl.value;
      } else if (origEl instanceof HTMLSelectElement) {
        const cSel = clone as HTMLSelectElement;
        cSel.value = origEl.value;
      }
    }

    for (let child = origNode.firstChild; child; child = child.nextSibling) {
      clone.appendChild(cloneWithComputedStyles(child));
    }
    return clone;
  }

  const clonedRoot = cloneWithComputedStyles(sourceEl) as HTMLElement;
  clonedRoot.style.margin = "0";
  clonedRoot.style.width = `${width}px`;
  clonedRoot.style.minWidth = `${width}px`;
  clonedRoot.style.maxWidth = `${width}px`;
  clonedRoot.style.height = `${height}px`;
  clonedRoot.style.minHeight = `${height}px`;
  clonedRoot.style.maxHeight = "none";
  clonedRoot.style.boxShadow = "none";
  clonedRoot.style.border = "none";
  clonedRoot.style.borderRadius = "0";
  clonedRoot.style.backgroundColor = "#ffffff";
  clonedRoot.style.boxSizing = "border-box";

  // Inline all <img> sources as data URLs so SVG <foreignObject> is self-contained and origin-clean
  const origImgs = Array.from(sourceEl.querySelectorAll("img"));
  const cloneImgs = Array.from(clonedRoot.querySelectorAll("img"));
  await Promise.all(
    origImgs.map(async (origImg, idx) => {
      const cloneImg = cloneImgs[idx];
      if (!cloneImg) return;
      const dataUrl = await imageToDataUrl(origImg);
      if (dataUrl) {
        cloneImg.setAttribute("src", dataUrl);
      }
    })
  );

  // Sync <select> option selected attributes if any exist
  const origSelects = Array.from(sourceEl.querySelectorAll("select"));
  const cloneSelects = Array.from(clonedRoot.querySelectorAll("select"));
  origSelects.forEach((origSel, idx) => {
    const cloneSel = cloneSelects[idx];
    if (!cloneSel) return;
    Array.from(cloneSel.options).forEach((opt, optIdx) => {
      if (origSel.options[optIdx]?.selected) {
        opt.setAttribute("selected", "selected");
      } else {
        opt.removeAttribute("selected");
      }
    });
  });

  clonedRoot.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  const serializedXhtml = new XMLSerializer().serializeToString(clonedRoot);
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="${width}" height="${height}">${serializedXhtml}</foreignObject></svg>`;
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = svgDataUrl;
  });

  // Render at 2.5x scale for crisp high-resolution print quality
  const scale = 2.5;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const aspect = canvas.height / canvas.width;

  let pdfW = pageWidth;
  let pdfH = pdfW * aspect;
  let posX = 0;
  let posY = 0;

  if (pdfH > pageHeight) {
    pdfH = pageHeight;
    pdfW = pdfH / aspect;
    posX = (pageWidth - pdfW) / 2;
    posY = 0;
  } else {
    posY = 0; // Align from top of A4 sheet just like the document preview
  }

  pdf.addImage(imgData, "PNG", posX, posY, pdfW, pdfH, undefined, "FAST");
  pdf.save(filename);
}
