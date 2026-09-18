# Design QA: 数字描红 0–10

- Source visual truth: `/Users/wangjianhua/Downloads/image_幼小衔接必练话题1-10数字描红..._0.png`
- Implementation capture: `/Users/wangjianhua/Downloads/数字描红练习题（0-10） (1).png`
- Browser state: `http://127.0.0.1:5175/generator/math`, 题型为“数字描红（0-10）”
- Browser viewport: 1280 × 720 CSS px
- Primary interactions tested: selected the number-tracing worksheet and completed image export
- Console errors: none
- Source pixels: 1080 × 1484
- Implementation pixels: 1588 × 2238; exported A4 paper at browser-generated high density
- CSS paper size: 210mm × 296mm
- Density normalization: compared as full-page aspect-ratio-normalized images, then checked the 1、4、7、9 rows at native resolution

## Full-view comparison evidence

- Both sheets use 0–10 rows, a black sample cell followed by grey tracing cells, and blue square practice grids with horizontal and vertical center guides.
- The implementation intentionally retains the product's A4 title, student information, footer, and larger row spacing.
- Square cells and single-digit placement in the left half match the current product requirements.

## Focused region comparison evidence

- `1`: now uses one complete vertical stroke and remains within the left half-cell.
- `4`: uses an open two-stroke teaching form; the diagonal/horizontal first stroke and vertical second stroke are both complete.
- `7`: contains a complete top horizontal stroke followed by the down-left diagonal.
- `9`: contains a closed upper loop and a continuous descending tail toward the lower-left.
- Sample and trace versions share the same path data, preventing shape drift between the black model and grey tracing guide.

## Required fidelity surfaces

- Fonts and typography: worksheet chrome retains the existing product typography; digits use thin, round-ended teaching strokes rather than a text font.
- Spacing and layout rhythm: 12mm × 12mm square cells; 15 cells per row; 11 rows remain inside one A4 sheet.
- Colors and visual tokens: red sample border, blue grid, pale blue guides, black model digit, and grey dashed tracing strokes are preserved.
- Image quality and asset fidelity: digits are resolution-independent paths and remain sharp in print/PDF/image export.
- Copy and content: title, student fields, 0–10 sequence, and footer are complete.

## Comparison history

1. Earlier implementation: `1` was too diagonal; `4` and `7` appeared incomplete; `9` used an incorrect path.
2. Fix: redrew `1`, split `4` into the correct two strokes, completed `7`, rebuilt `9` as loop plus tail, and aligned `10` with the corrected vertical `1`.
3. Post-fix evidence: browser inspection and exported implementation capture confirm all four corrected forms render completely in both sample and tracing cells.

## Findings

- No actionable P0/P1/P2 visual mismatch remains for the requested digit-writing corrections.
- P3: the supplied reference shows a slightly slanted `1`, while the latest explicit requirement asks for a non-slanted `1`; the implementation follows the latest explicit requirement.

## Implementation checklist

- [x] Correct `1`, `4`, `7`, and `9` teaching forms.
- [x] Apply identical geometry to sample and tracing guides.
- [x] Confirm rows remain complete and printable on A4.
- [x] Check browser rendering and exported image output.

final result: passed
