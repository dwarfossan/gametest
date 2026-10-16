# Male fighter miniature prototype

- `poses.webp`: approved idle, downward slash, forward hurt and raised right-hand item poses, on a transparent 2×2 sheet. Background removal used the image editing tool; the alpha channel was checked and the sprites verified against a white background.
- `guard.webp`: approved left off-hand defense pose, transparent.
- Both are lossless WebP packages of generated PNG art, with no pixel resizing or recoloring. SVG viewports/clip paths select poses without redrawing them.
- Equipment, grip repaint, wood base, mirroring, prone transform and hop are runtime SVG/CSS in `js/ui/fighter-sprite.mjs` and `css/paperdoll.css`.
- Body armor is fixed in this art. Only the existing human male fighter with one-handed equipment uses the prototype. Female/nonhuman fighters and two-handed/ranged grips retain the existing paper doll. No rule stats or equipment ownership are inferred from artwork.
