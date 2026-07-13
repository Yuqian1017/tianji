# Generate NPC portraits + dialog ornament for the UIUX batch (owner feedback 2026-07-13).
# Style anchor: same gongbi/ink-wash base as portrait-shen-{f,m} (generate-game-assets.py).
# Pipeline: gpt-image-2 (openai_client) -> fal birefnet cutout (portraits only) -> webp.
# Fail loudly per item; summary at end. Ornament keeps white bg (used via CSS multiply).
import base64
import sys
import time
import concurrent.futures as cf
from pathlib import Path

sys.path.insert(0, "/Users/junshi/CC projects/_system/toolbox")
from clients import openai_client  # noqa: E402
from clients.fal_client import _headers as fal_headers, BASE_URL as FAL_BASE  # noqa: E402

import httpx  # noqa: E402
from PIL import Image  # noqa: E402

OUT = Path("/Users/junshi/CC projects/projects/games/tianji/public/assets/game")
OUT.mkdir(parents=True, exist_ok=True)

NPC_BASE = (
    "Traditional Chinese gongbi-style character portrait with soft ink-wash shading, "
    "full body standing pose for a visual novel, plain uniform light cream background (#f0ece4), "
    "muted colors, elegant, subdued palette matching an ink-wash game, no text, single character"
)

PORTRAITS = {
    "portrait-zheng": NPC_BASE + (
        ", elderly scholar-librarian in his sixties, thin and slightly hunched, neat grey "
        "topknot and thin grey beard, dark blue-grey scholar robe with two neat square patches "
        "on the sleeve cuffs, hugging a blue cloth-bound book case protectively with both arms "
        "like holding a newborn grandchild, squinting fussy stern expression, reading-strained eyes"
    ),
    "portrait-gu": NPC_BASE + (
        ", chubby round-faced young novice disciple around eighteen, plain grey novice robe "
        "slightly rumpled, holding a paper lantern with both hands, timid friendly expression "
        "with wide slightly worried eyes, faint sweat on the brow, endearing earnest energy"
    ),
    "portrait-han": NPC_BASE + (
        ", dignified law-enforcement hall elder in his fifties, tall upright bearing, short dark "
        "beard with grey streaks, deep charcoal robe with a formal dark sash and a small bronze "
        "token of office hanging at the belt, hands clasped behind his back, stern but fair "
        "weathered face, calm authoritative gaze"
    ),
}

ORNAMENTS = {
    "ui-corner-cloud": (
        "ornamental corner flourish design for a game dialog box, traditional Chinese auspicious "
        "cloud pattern (祥云纹) flowing from one corner with a subtle antique bronze coin motif "
        "woven in, muted antique gold and ink lines on plain pure white background, elegant thin "
        "linework, asymmetric corner ornament occupying the upper-left quadrant, no text, no border"
    ),
}

results = {}


def gen(name, prompt, size):
    t0 = time.time()
    try:
        openai_client.generate_image(prompt, size=size, quality="medium", save_to=str(OUT / f"{name}.png"))
        results[name] = f"OK {time.time() - t0:.0f}s"
    except Exception as e:
        results[name] = f"FAIL {type(e).__name__}: {e}"


def birefnet_cutout(name):
    """Alpha-cutout via fal birefnet (same approach as the M2 shen portraits)."""
    t0 = time.time()
    src = OUT / f"{name}.png"
    data_uri = "data:image/png;base64," + base64.b64encode(src.read_bytes()).decode()
    r = httpx.post(
        f"{FAL_BASE}/fal-ai/birefnet",
        json={"image_url": data_uri},
        headers=fal_headers(),
        timeout=180,
    )
    r.raise_for_status()
    url = r.json()["image"]["url"]
    png = httpx.get(url, timeout=120)
    png.raise_for_status()
    cut = OUT / f"{name}-cut.png"
    cut.write_bytes(png.content)
    return f"cutout OK {time.time() - t0:.0f}s"


def to_webp(name, lossless_alpha=False):
    src = OUT / f"{name}.png"
    img = Image.open(src)
    img.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6, lossless=lossless_alpha)
    return (OUT / f"{name}.webp").stat().st_size // 1024


if __name__ == "__main__":
    jobs = []
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for n, p in PORTRAITS.items():
            jobs.append(ex.submit(gen, n, p, "1024x1536"))
        for n, p in ORNAMENTS.items():
            jobs.append(ex.submit(gen, n, p, "1024x1024"))
        cf.wait(jobs)

    print("=== generation ===")
    for k, v in sorted(results.items()):
        print(f"{'✓' if v.startswith('OK') else '✗'} {k}: {v}")
    if any(not v.startswith("OK") for v in results.values()):
        sys.exit(1)

    print("=== cutout (portraits) ===")
    for n in PORTRAITS:
        try:
            print(f"✓ {n}: {birefnet_cutout(n)}")
        except Exception as e:
            print(f"✗ {n}: FAIL {type(e).__name__}: {e}")
            sys.exit(1)

    print("=== webp ===")
    for n in PORTRAITS:
        print(f"✓ {n}-cut.webp: {to_webp(n + '-cut')}KB")
    for n in ORNAMENTS:
        print(f"✓ {n}.webp: {to_webp(n)}KB")
    print("all done")
