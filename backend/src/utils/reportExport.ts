function escapeCsv(value: unknown) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ];
  return lines.join("\n");
}

export function createSimplePdf(title: string, rows: string[]) {
  const lines = [title, "", ...rows];
  const escaped = lines
    .map((line, index) => `BT /F1 11 Tf 50 ${780 - index * 16} Td (${line.replace(/[()\\]/g, "\\$&")}) Tj ET`)
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${escaped.length} >> stream\n${escaped}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let content = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(content.length);
    content += `${object}\n`;
  }

  const xrefPosition = content.length;
  content += `xref\n0 ${objects.length + 1}\n`;
  content += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    content += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  content += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  return Buffer.from(content, "utf-8");
}
