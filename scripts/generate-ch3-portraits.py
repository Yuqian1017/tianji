# Generate chapter-3 NPC portraits (宋补之/崔小砚/白芷) — same pipeline as
# generate-npc-portraits.py: gpt-image-2 -> fal birefnet cutout -> webp.
# Style anchor identical to the shen/zheng/gu/han portraits. Fail loudly.
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

NPC_BASE = (
    "Traditional Chinese gongbi-style character portrait with soft ink-wash shading, "
    "full body standing pose for a visual novel, plain uniform light cream background (#f0ece4), "
    "muted colors, elegant, subdued palette matching an ink-wash game, no text, single character"
)

PORTRAITS = {
    "portrait-song": NPC_BASE + (
        ", warm chatty master book-restorer in his mid-fifties, slightly plump, grey-streaked "
        "hair in a loose bun, paste-stained work apron over a brown craftsman robe, sleeves "
        "rolled up, holding a wide paste brush in one hand and a half-mended book leaf in the "
        "other, bright eager talkative expression, laugh lines, skilled sturdy hands"
    ),
    "portrait-cui": NPC_BASE + (
        ", proud young scribe around twenty-two, slender, immaculate dark scholar robe with "
        "clean white cuffs, hair in a precise topknot, holding a fine writing brush upright "
        "like a sword, chin slightly lifted, haughty but not unkind expression, ink-stained "
        "middle finger the only untidy thing about him"
    ),
    "portrait-baizhi": NPC_BASE + (
        ", quiet weathered woman in her early thirties, tall and thin, plain undyed hemp "
        "clothes with a laundry apron, sleeves bound with cord, hair wrapped in a simple "
        "cloth kerchief, wringing a twisted piece of wet cloth with both hands, calm watchful "
        "eyes that notice everything, guarded expression, sun-browned steady hands"
    ),
}

results = {}


def gen(name, prompt):
    t0 = time.time()
    try:
        openai_client.generate_image(prompt, size="1024x1536", quality="medium", save_to=str(OUT / f"{name}.png"))
        results[name] = f"OK {time.time() - t0:.0f}s"
    except Exception as e:
        results[name] = f"FAIL {type(e).__name__}: {e}"


def birefnet_cutout(name):
    t0 = time.time()
    src = OUT / f"{name}.png"
    data_uri = "data:image/png;base64," + base64.b64encode(src.read_bytes()).decode()
    r = httpx.post(f"{FAL_BASE}/fal-ai/birefnet", json={"image_url": data_uri}, headers=fal_headers(), timeout=180)
    r.raise_for_status()
    png = httpx.get(r.json()["image"]["url"], timeout=120)
    png.raise_for_status()
    (OUT / f"{name}-cut.png").write_bytes(png.content)
    return f"cutout OK {time.time() - t0:.0f}s"


def to_webp(name):
    img = Image.open(OUT / f"{name}.png")
    img.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
    return (OUT / f"{name}.webp").stat().st_size // 1024


if __name__ == "__main__":
    with cf.ThreadPoolExecutor(max_workers=3) as ex:
        cf.wait([ex.submit(gen, n, p) for n, p in PORTRAITS.items()])

    print("=== generation ===")
    for k, v in sorted(results.items()):
        print(f"{'✓' if v.startswith('OK') else '✗'} {k}: {v}")
    if any(not v.startswith("OK") for v in results.values()):
        sys.exit(1)

    print("=== cutout ===")
    for n in PORTRAITS:
        try:
            print(f"✓ {n}: {birefnet_cutout(n)}")
        except Exception as e:
            print(f"✗ {n}: FAIL {type(e).__name__}: {e}")
            sys.exit(1)

    print("=== webp ===")
    for n in PORTRAITS:
        print(f"✓ {n}-cut.webp: {to_webp(n + '-cut')}KB")
    print("all done")
