# Research: AI Icon Generation Platforms for Arike App Icon

**Feature**: 004-arike-app-icon  
**Date**: 2026-05-16  
**Purpose**: Evaluate AI generation platforms for producing the Arike brand icon ("closer to home" — dark navy background, warm amber/gold accent, home/warmth motif), assess license compatibility with MIT open-source distribution, and document the recommended generation prompt.

---

## 1. Platform Comparison Table

| Platform | Free Tier | SVG Export | OS-Compatible License (free) | OS-Compatible License (paid) | Developer Ease | Icon/Logo Quality | Web-Based |
|---|---|---|---|---|---|---|---|
| **Recraft.ai** | Yes — 30 credits/day; personal use only, **no commercial rights** | ✅ Native SVG (core feature) | ⚠️ **No** — Recraft retains ownership on free tier; no commercial use | ✅ **Yes** — full ownership + commercial rights on all paid plans (from $10/mo) | ⭐⭐⭐⭐⭐ Designed for designers and developers; clean UI, icon/logo styles built-in | ⭐⭐⭐⭐⭐ Best-in-class for flat icons, geometric shapes, SVG logos | ✅ Yes |
| **ChatGPT / DALL-E 3** | Yes — free ChatGPT tier; limited daily generations | ❌ Raster PNG only; requires vectorization step | ✅ **Yes** — OpenAI ToS assigns output ownership to user (free and paid); commercial use allowed | ✅ **Yes** — same ownership model | ⭐⭐⭐⭐ Familiar chat interface; prompt iteration is natural language | ⭐⭐⭐ Good photorealistic/painterly; flat geometric icon quality inconsistent | ✅ Yes |
| **Adobe Firefly** | ❌ No standalone free tier; Firefly requires paid plan ($9.99/mo+); limited trial credits only | ❌ Raster PNG/JPEG only; requires vectorization via Illustrator (separate subscription) | N/A — no true free tier | ✅ **Yes** — Adobe IP indemnification; "commercially safe" outputs per Adobe ToS; outputs can be distributed | ⭐⭐ Requires Adobe account + subscription; UI is polished but heavyweight for a one-time icon | ⭐⭐⭐⭐ High quality; good for detailed illustration; less suited for flat minimal icons | ✅ Yes (web app) |
| **Midjourney** | ❌ No free tier (removed 2024) — paid from $10/mo | ❌ Raster PNG only; no SVG | N/A — no free tier | ✅ **Yes** — paid users own generated images commercially | ⭐⭐⭐ Discord-based (can also use web now); less intuitive for newcomers | ⭐⭐⭐⭐ Excellent photorealistic/painterly quality; struggles with strict flat iconography | ✅ Yes (web + Discord) |
| **Ideogram.ai** | Yes — limited public generations (slow credits); generations are public on free tier | ❌ Raster PNG only; no SVG | ⚠️ **Unclear** — free tier images are public; commercial terms not explicitly permissive for MIT redistribution without verification | ✅ **Yes** — paid tiers grant commercial rights and private generations | ⭐⭐⭐⭐ Clean web interface; strong text-in-image capability | ⭐⭐⭐ Good for illustrative icons; known for text accuracy; less control over geometric precision | ✅ Yes |
| **Leonardo.ai** | Yes — ~150 tokens/day free; some models restricted | ❌ Raster PNG only; no SVG | ⚠️ **Unclear** — free tier ToS grants limited commercial use but redistribution in open-source unclear | ✅ **Yes** — paid tiers grant commercial rights | ⭐⭐⭐⭐ Good web UI; many fine-tuned models | ⭐⭐⭐ Versatile; quality depends on model selected; not specialized for logo/icon work | ✅ Yes |
| **Canva AI (Magic Media)** | Yes — limited free generations; requires Canva account | ❌ Raster PNG/JPEG; SVG export only on Canva Pro ($15/mo) but the SVG is Canva's format wrapper, not clean AI-native SVG | ⚠️ **Yes with caveats** — Canva ToS grants commercial use of outputs; however SVG export is locked behind Pro; generated content license suitable for open-source if you own the output | N/A for SVG path | ⭐⭐⭐⭐ Very accessible; drag-and-drop | ⭐⭐⭐ Template/general purpose; less precise for custom icon concepts | ✅ Yes |

---

## 2. SVG Acquisition Strategy by Platform

The canonical source asset for Arike must be an SVG (`docs/brand/arike-icon-dark.svg`). Platforms differ significantly in how SVG is obtained:

| Approach | Platforms | Notes |
|---|---|---|
| **Native SVG generation** | Recraft.ai | Output is a true vector SVG. Best path. |
| **Raster → Auto-trace** | All others | Use `potrace` (CLI), Inkscape "Trace Bitmap", or vectorizer.ai to convert PNG to SVG. Works well for simple 1-2 color icons with crisp shapes; poor for photorealistic or noisy outputs. DALL-E 3's output style for flat icons is compatible with auto-trace. |
| **Manual redraw in Inkscape** | All raster outputs | Highest quality but requires design skill and time. Not recommended for developer-first workflow. |

---

## 3. Open-Source License Safety Analysis

For an MIT-licensed open-source repository, the generated icon must be:
1. Owned by the committing developer (or clearly licensed for redistribution)
2. Allowed for commercial use (downstream users of the MIT project may use Arike commercially)
3. Free of third-party IP claims

| Platform | Free Tier — Safe to commit to MIT repo? | Paid Tier — Safe to commit to MIT repo? | Notes |
|---|---|---|---|
| **Recraft.ai** | ❌ **No** — Recraft owns free-tier images; redistribution/commercial use prohibited | ✅ **Yes** — Full ownership granted at time of generation on paid plan; ownership retained after subscription cancellation | Must generate on a paid plan ($10/mo minimum). One month is sufficient. |
| **ChatGPT / DALL-E 3** | ✅ **Yes** — OpenAI ToS (Jan 2026): "you own the Output" and "We hereby assign to you all our right, title, and interest, if any, in and to Output." Applies to both free and paid users. | ✅ **Yes** | Strongest free-tier legal position of all platforms. No cost for basic usage. |
| **Adobe Firefly** | N/A (no free tier) | ✅ **Yes** — Adobe provides IP indemnification for Firefly-generated content in paid plans; outputs are safe for commercial redistribution | Paid plan required; $9.99/mo minimum. Overkill for a one-time icon. |
| **Midjourney** | N/A (no free tier) | ✅ **Yes** (non-enterprise) — Standard plan users own commercially; free users did not | Paid only; $10/mo. |
| **Ideogram.ai** | ⚠️ **Unverified** — ToS states "you own" generated images, but free tier images are public; commercial use for redistribution in open-source requires explicit verification | ✅ **Yes** (paid) | Recommend verifying ToS section 4 before using free tier output in a committed repo. |
| **Leonardo.ai** | ⚠️ **Unverified** — ToS grants usage rights but redistribution terms in an open-source context are not explicitly clear | ✅ **Yes** (paid) | Verify before committing. |
| **Canva AI** | ⚠️ **Partial** — Canva ToS grants you commercial use of outputs; however Canva retains a license; for open-source redistribution the output should be checked against their specific creator content policy | N/A (SVG needs Pro, then clean SVG is not guaranteed) | Not recommended for SVG-first workflow. |

---

## 4. Platform Deep Dives

### 4.1 Recraft.ai — Primary Recommendation

**Strengths**:
- Only mainstream platform with **native SVG output** — the generated file is a clean, editable vector, not a traced raster
- Dedicated **icon and logo styles** in the style library (flat icon, line icon, sticker, etc.)
- Custom color palette support — can specify exact hex values for navy background and amber/gold accent
- 30 credits/day on free tier sufficient to iterate and preview; one month of Basic plan ($10) unlocks commercial rights + private generation for final asset
- Web-based; no install

**Weaknesses**:
- Free tier has zero commercial rights — must pay for the final committed asset
- $10/mo cost (though cancellable after one month)

**License path for Arike**: Subscribe to Basic ($10/mo), generate the icon, cancel subscription. Images generated during paid period retain full ownership and commercial rights permanently.

---

### 4.2 ChatGPT / DALL-E 3 — Alternative Recommendation

**Strengths**:
- **Free tier output is fully owned by the user** — strongest free-tier license of all platforms
- No cost for basic usage (ChatGPT free account)
- Natural language prompt iteration; familiar interface for developers
- Good for conceptual exploration

**Weaknesses**:
- **No SVG output** — generates PNG only; requires a vectorization step
- Vectorization of complex or noisy images introduces artifacts; works best for simple, high-contrast icons
- Quality for strict flat geometric icons is inconsistent vs. Recraft's purpose-built icon models
- Free tier has daily generation limits (vary; typically 2–5 DALL-E generations/day on free ChatGPT)

**SVG conversion pipeline** (for developer workflow):
```bash
# Install potrace (Linux)
sudo apt install potrace imagemagick

# Convert PNG to PBM (black/white bitmap), then trace to SVG
convert arike-icon.png -threshold 50% arike-icon.pbm
potrace arike-icon.pbm -s -o arike-icon-dark.svg

# OR use vectorizer.ai (web, free for small files) for higher quality
# OR use Inkscape: File > Import > Trace Bitmap (Path > Trace Bitmap)
```

**License path for Arike**: Use ChatGPT free tier; output is owned by you per OpenAI ToS. Vectorize the PNG and commit the SVG. Note in the repo's `docs/brand/` with a comment crediting DALL-E 3.

---

### 4.3 Adobe Firefly

Not recommended for Arike. No free tier for standalone Firefly; minimum $9.99/mo. Outputs are raster only; SVG requires Illustrator (additional subscription). Disproportionate cost for a one-time icon asset. Image Trace in Illustrator is high quality but adds design tooling overhead.

---

### 4.4 Midjourney

Not recommended for Arike. No free tier; subscription required. Raster PNG only. Midjourney excels at photorealistic and illustrative art but produces inconsistent results for strict flat minimal icon work. The Discord-based UX is less efficient for iterative icon work.

---

### 4.5 Ideogram.ai

Viable alternative for the raster-only path (with vectorization). Free tier exists; strong text-in-image capability (not needed here). License safety on free tier is unverified for open-source redistribution. If using paid plan ($15/mo), commercial rights are granted. Not recommended over Recraft for this use case.

---

### 4.6 Canva AI (Magic Media)

Not recommended for Arike. SVG export requires Canva Pro; the resulting SVG is wrapped in Canva's format and not a clean editable vector. Recraft is strictly superior for SVG-native icon generation.

---

## 5. Primary Recommendation: Recraft.ai (Basic Plan, $10/mo × 1 month)

**Rationale**:
- Native SVG output eliminates the raster-to-vector pipeline, reducing quality loss and manual cleanup
- Built-in icon/logo styles produce flat, geometric, clean results that match the Arike icon concept
- Custom color palette lets you specify `#1a2035` (dark navy) and `#f59e0b` (amber) directly
- One month of Basic plan ($10) is sufficient to generate and own the final asset; cancel after committing
- Ownership is permanent after generation — subscription cancellation does not revoke rights
- **Total cost: $10 one-time** (one month Basic, then cancel)

**MIT compatibility**: ✅ Full commercial rights granted at generation time. Safe to commit to an MIT-licensed repository and distribute to all downstream users.

---

## 6. Alternative Recommendation: ChatGPT / DALL-E 3 (Free)

**Rationale**:
- Zero cost — suitable if the $10 spend is not desirable
- OpenAI's ToS assigns full output ownership to the user on both free and paid tiers — the strongest free-tier license available
- Sufficient for concept exploration and initial iterations
- Requires a vectorization step post-generation (adds ~30 minutes of manual work via Inkscape or vectorizer.ai)
- Acceptable quality for simple 2-color flat icon when auto-trace is applied to a high-contrast PNG

**MIT compatibility**: ✅ OpenAI assigns output to user; safe for MIT-licensed open-source redistribution.

---

## 7. Exact AI Prompt for Arike Icon Generation

Use this prompt verbatim on both Recraft.ai and ChatGPT/DALL-E 3. Adjust style selector in Recraft's UI to "Flat icon" or "Vector icon".

### Primary Prompt (Recraft.ai — use with "Flat icon" or "SVG icon" style)

```
A minimal flat app icon for a browser new-tab app called "Arike" (meaning "closer" in Malayalam). 
The icon concept is "closer to home" — a simple, clean house/home silhouette centered on a deep navy background (#1a2035). 
The house shape is rendered in warm amber-gold (#f59e0b) with a soft warm inner glow suggesting warmth and proximity. 
The house is geometric and minimal — a simple triangular roof over a rectangular body, no details. 
A small warm amber heart or glowing dot floats centered just above the house peak, suggesting closeness and warmth. 
Dark navy background fills the entire square canvas. 
Style: flat icon, minimal, clean, bold, icon-safe at 16×16 pixels. No text, no drop shadow, no gradient background. 
Output: square aspect ratio, SVG.
```

### Alternative Prompt (ChatGPT / DALL-E 3 — use in ChatGPT image generation)

```
A minimal flat app icon design for a browser new-tab app. The concept is "closer to home". 
Design: a simple, clean home/house silhouette centered on a deep navy-blue (#1a2035) square background. 
The house shape is warm amber-gold (#f59e0b) — geometric and minimal: a triangle roof above a rectangle body, no windows, no door details. 
A small warm amber glow or tiny heart floats just above the rooftop, conveying warmth and closeness. 
Style: flat icon, vector-like, minimal, high-contrast, crisp edges suitable for scaling down to 16×16 favicon. 
No text. No drop shadow. No gradients. Solid flat colors. White or very light amber for the glow only. Square 512×512 canvas.
```

### SVG Conversion Step (if using DALL-E 3 output)

After downloading the PNG from ChatGPT:
1. Open in [vectorizer.ai](https://vectorizer.ai) (free tier handles simple 2-color icons) — download SVG
2. OR in Inkscape: `Path > Trace Bitmap` with "Multiple scans: Colors" (2 colors), then clean up paths manually
3. Save as `docs/brand/arike-icon-dark.svg`

---

## 8. Icon Placement Map

Per the spec, the generated icon should be deployed in the following locations. These are identified based on the project structure and common open-source project conventions:

| Location | File | Format | Size | Priority |
|---|---|---|---|---|
| Browser tab (favicon) | `src/app/favicon.ico` | ICO (16×16 + 32×32) | 16px, 32px | P1 |
| Next.js metadata icon | `src/app/icon.png` | PNG | 512×512 | P1 |
| Apple home screen | `public/apple-touch-icon.png` | PNG | 180×180 | P2 |
| PWA manifest | `public/icon-192.png`, `public/icon-512.png` | PNG | 192px, 512px | P2 |
| Open Graph / social preview | `public/og-image.png` | PNG | 1200×630 (icon centered on navy bg) | P2 |
| README header | `docs/brand/arike-icon-light.svg` (or PNG) | SVG/PNG | 64–128px wide | P2 |
| GitHub social preview | Repository Settings > Social Preview | PNG | 1280×640 | P3 |
| Docker Hub repository logo | Manual upload on hub.docker.com | PNG | 240×240 | P3 |
| Dockerfile OCI annotation | `Dockerfile` LABEL `org.opencontainers.image.logo` | URL or base64 | — | P3 |

---

## 9. Summary Decision

| Criterion | Decision |
|---|---|
| **Chosen platform** | Recraft.ai (Basic plan, $10 for one month) |
| **Format** | Native SVG — no vectorization step needed |
| **License** | Full commercial ownership; safe for MIT-licensed open-source repo |
| **Cost** | $10 one-time (cancel after generation) |
| **Fallback** | ChatGPT DALL-E 3 (free) → PNG → vectorizer.ai → SVG |
| **Prompt** | See Section 7 above |
| **Variants** | Dark-background (primary) + light/transparent-background (README) |
