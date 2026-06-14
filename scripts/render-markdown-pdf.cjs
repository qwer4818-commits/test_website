const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { marked } = require("marked");

const chrome =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const jobs = [
  ["docs/PRD.md", "docs/PRD.pdf"],
  ["docs/AI_Development_Report.md", "docs/AI_Development_Report.pdf"],
];

const css = `
  @page { size: A4; margin: 18mm 17mm 20mm; }
  * { box-sizing: border-box; }
  html { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; }
  body { color: #17202a; font-size: 10.5pt; line-height: 1.62; margin: 0; }
  h1, h2, h3 { color: #123b3a; line-height: 1.28; break-after: avoid; }
  h1 { font-size: 25pt; margin: 0 0 8mm; border-bottom: 2px solid #1f7a73; padding-bottom: 4mm; }
  h2 { font-size: 17pt; margin: 10mm 0 3.5mm; }
  h3 { font-size: 13pt; margin: 7mm 0 2.5mm; }
  p { margin: 0 0 3.2mm; }
  blockquote { margin: 0 0 6mm; padding: 3mm 4mm; border-left: 4px solid #df7b38; background: #fff6ed; color: #4a3b31; }
  blockquote p { margin: 0; }
  ul, ol { margin: 1.5mm 0 4mm; padding-left: 7mm; }
  li { margin: 1mm 0; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0 6mm; font-size: 9.3pt; break-inside: auto; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { border: 1px solid #cad6d4; padding: 2.2mm 2.5mm; vertical-align: top; }
  th { background: #e9f3f1; color: #123b3a; text-align: left; }
  code { font-family: "SFMono-Regular", Menlo, monospace; font-size: 0.9em; background: #f2f4f4; padding: 0.2em 0.35em; border-radius: 3px; overflow-wrap: anywhere; }
  pre { background: #f2f4f4; padding: 3mm; white-space: pre-wrap; break-inside: avoid; }
  pre code { padding: 0; }
  a { color: #146c67; text-decoration: none; overflow-wrap: anywhere; }
  hr { border: 0; border-top: 1px solid #cad6d4; margin: 7mm 0; }
  strong { color: #153f3d; }
`;

for (const [input, output] of jobs) {
  const markdown = fs.readFileSync(input, "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1] || path.basename(input);
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${title.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</title>
  <style>${css}</style>
</head>
<body>${marked.parse(markdown, { gfm: true })}</body>
</html>`;
  const tempHtml = path.join(os.tmpdir(), `${path.basename(input, ".md")}-${Date.now()}.html`);
  fs.writeFileSync(tempHtml, html);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${path.resolve(output)}`,
    `file://${tempHtml}`,
  ], { stdio: "inherit" });
  fs.unlinkSync(tempHtml);
  console.log(`Created ${output}`);
}
