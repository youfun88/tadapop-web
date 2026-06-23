# BOBO → Rive presenter avatar — authoring + integration guide

Goal: replace the hand-rigged SVG host in the explainer film (`film.js` →
`hostSVG()` / `.film-host-inner`) with a **Rive** vector BOBO that blinks,
gestures, lip-syncs to the voiceover, and pops a "Tada!" — keeping the same
look as the rendered mascot (one-eyed blue/purple alien, muscular, smartwatch).

Rive is free (editor at https://rive.app + free runtimes). The art is redrawn
as vector with gradients, so it won't be a literal 3D render, but it can get
very close and it moves *smoothly* (real interpolation, not CSS keyframes).

---

## 0. The contract (DO THIS FIRST — the art must match these names)

The film drives one **State Machine** named exactly `Bobo`. It uses these
inputs (names are case-sensitive — the integration code below depends on them):

| Input      | Type    | Driven by film | Meaning |
|------------|---------|----------------|---------|
| `talking`  | Boolean | `playVO`/`stopVO` | true while a VO clip plays → idle⇄speaking loop |
| `mouth`    | Number 0–100 | audio analyser (per frame) | live mouth-open amount (lip-sync) |
| `tada`     | Trigger | `boboTada()` | celebration: arm pump + bounce + sparkle |
| `gesture`  | Trigger | optional, per scene | one-off arm gesture for emphasis |

Blink and antennae sway should be **automatic** inside the state machine
(looping timelines with a bit of randomized timing), not driven from JS.

If you name them differently, just tell me and I'll match the JS.

---

## 1. Rig the painted hero (CHOSEN ROUTE — keep the rendered look)

Don't vector-trace and don't slice the body apart (moving a painted arm exposes
body pixels that don't exist). Instead:

1. Get **one clean BOBO image**: transparent background, high-res, mouth-closed/
   neutral. Source it by exporting the original raster from Rive, AI background-
   removal, or regenerating (prompt in the last section). Save to `assets/`.
2. Import it as a single image and lay an **Image Mesh** over the whole BOBO.
   Drive regions with **bones**: antennae (sway), arms (flex/gesture), and a
   body/head bone for the nod. Gestures + the "Tada!" arm pump are mesh-only —
   no cutting, no inpainting.
3. **Blink**: the art has no eyelid, so draw a *new* body-colored lid shape on
   top of the eye and animate it closing. (Ask me — I generate this matched to
   the image's eye geometry.)
4. **Lip-sync**: overlay 2–3 small mouth shapes on the mouth (or mesh-deform the
   mouth region). I generate these palette-matched too.

Net asset list: 1 whole-BOBO image + a painted eyelid overlay + a couple mouth
overlays. Everything else is bones on the single mesh.

### Alternative: redraw as separated vector parts

(Only if you abandon the painted look.) Import the reference as a backing image,
then trace it with the vector pen on these **separate groups** (each becomes a
riggable node):

- `body` (torso + shorts, muscle shading as a child)
- `head`
- `eye` group: `sclera`, `iris`, `pupil`, `highlight`, and a separate
  `eyelid` shape (top lid that scales/translates down to blink)
- `antenna_L`, `antenna_R` (each with its glowing tip)
- `arm_L`, `arm_R` (upper + forearm + fist; put the **smartwatch** on `arm_L`)
- `mouth` group: either a small set of mouth shapes (closed / mid / open) you
  blend with the `mouth` input, OR one mouth path you scale vertically. Vertical
  scale is simplest and matches what the SVG does today.

Use **gradients** (radial on body/iris, the blue→purple body ramp from the
reference) so it reads as shaded, not flat.

## 2. Rig

- Add **bones** for the antennae and arms; bind the arm/forearm shapes to them
  so they bend smoothly. Use **meshes** on the body/arms if you want squash.
- Set transform origins sensibly (antennae pivot at the base, arms at the
  shoulder) — same as the current SVG `transform-origin` choices.

## 3. State machine `Bobo`

- **Idle** (default): gentle body bob, antennae sway, auto-blink every 3–6 s.
- **Speaking**: entered when `talking == true`. Slightly more body motion +
  arm "explaining" micro-gestures. While here, the `mouth` number drives the
  mouth (map a 1-D blend or vertical scale to `mouth` 0→100).
- `tada` trigger → a short one-shot state: arm pump + scale bounce + sparkle,
  then return.
- `gesture` trigger → one-shot arm gesture, returns to current state.

Keep it lightweight; the host is rendered small (~120 px circle).

## 4. Export

- File → Export → **Runtime (.riv)**. Save as `assets/host/bobo.riv`.
- Note the **artboard** name and confirm the state machine is `Bobo`.

---

## 5. Integration (drop-in for film.js — wire when bobo.riv exists)

Add the runtime once in `index.html` (before `film.js`):

```html
<script src="https://unpkg.com/@rive-app/canvas@2/rive.min.js"></script>
```

Then in `film.js`, replace the SVG host with a Rive canvas and bridge the
existing hooks. Sketch (we'll finalize + test together once the .riv loads):

```js
// --- Rive host (graceful: falls back to hostSVG() if unavailable) ---
let riveBobo = null, riveInputs = {};
function mountRiveHost(innerEl) {
  if (!window.rive) return false;            // runtime not loaded → keep SVG
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  canvas.style.width = canvas.style.height = '100%';
  innerEl.innerHTML = ''; innerEl.appendChild(canvas);
  try {
    riveBobo = new rive.Rive({
      src: '/assets/host/bobo.riv',
      canvas,
      autoplay: true,
      stateMachines: 'Bobo',
      onLoad: () => {
        riveBobo.resizeDrawingSurfaceToCanvas();
        const sm = riveBobo.stateMachineInputs('Bobo') || [];
        sm.forEach((i) => { riveInputs[i.name] = i; });
      },
    });
    return true;
  } catch (e) { return false; }              // any failure → SVG fallback
}

// then, in the existing functions:
function setMouth(open) {                     // open is 0..1
  if (riveInputs.mouth) { riveInputs.mouth.value = Math.max(0, Math.min(1, open)) * 100; return; }
  /* ...existing SVG scale fallback... */
}
// playVO():  if (riveInputs.talking) riveInputs.talking.value = true;
// stopVO():  if (riveInputs.talking) riveInputs.talking.value = false;
// boboTada(): if (riveInputs.tada) riveInputs.tada.fire();
```

The audio analyser stays exactly as-is — `startMouth()` already computes a
0–1 loudness per frame; it just feeds the `mouth` input instead of scaling the
SVG path. Captions, VO MP3s, reduced-motion, and the "Tada!" timing are
unchanged. If `bobo.riv` 404s or the runtime is blocked, the current SVG BOBO
keeps playing — zero regression risk.

---

## Making the source art (optional, to match the rendered look)

Rive needs vector you draw, but you can trace over a high-quality reference.
To generate consistent BOBO references (turnaround + expressions) with an image
model, prompt for: "one-eyed cartoon alien mascot, single large green eye,
blue-to-purple gradient body, muscular torso, two antennae with glowing pink
tips, green smartwatch on wrist, clean vector style, front view, neutral pose,
plain background, character sheet." Generate a front + 3/4 + mouth-open +
arm-up set, then trace in Rive. (Image generation needs its own API key —
Midjourney / OpenAI images / Replicate-SDXL — it's not part of this repo.)
