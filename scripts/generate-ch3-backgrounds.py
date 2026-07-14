# Generate 3 backgrounds for ch3 datafication + qiannang M3 (parallel slot while ch3 R1 runs).
# Style anchor identical to generate-game-assets.py. Fail loudly; webp at end.
import sys
import time
import concurrent.futures as cf
from pathlib import Path

sys.path.insert(0, "/Users/junshi/CC projects/_system/toolbox")
from clients import openai_client  # noqa: E402
from PIL import Image  # noqa: E402

OUT = Path("/Users/junshi/CC projects/projects/games/tianji/public/assets/game")

STYLE = ("Traditional Chinese ink-wash painting with light watercolor tints (浅绛 style), "
         "game background art, muted cream and ink tones with subtle gold accents, "
         "atmospheric, no people, no text, no calligraphy characters, wide composition")

BACKGROUNDS = {
    "bg-xiushufang": (
        "small book-restoration workshop courtyard in a mountain sect, three low plain rooms "
        "around a sunny yard, sheets of paper drying on bamboo racks, a workbench with brushes "
        "and paste bowls under the eaves, morning light, humble craftsman atmosphere"
    ),
    "bg-cangjinge-nei": (
        "interior of an ancient two-story library pavilion, second floor: tall dark wooden "
        "bookshelves with scroll cases and stitched volumes, a long reading table by a lattice "
        "window with soft daylight slanting in, dust motes in the light beam, quiet scholarly "
        "atmosphere, one shelf section conspicuously tidy"
    ),
    "bg-jishi": (
        "lively morning market at the foot of a mountain sect gate, two rows of humble stalls "
        "along a stone-paved slope selling herbs incense paper and knotted cords, cloth awnings, "
        "steam from a food stall, distant mountain gate in mist above the street, warm morning light"
    ),
}

results = {}


def gen(name, prompt):
    t0 = time.time()
    try:
        openai_client.generate_image(f"{STYLE}: {prompt}", size="1536x1024", quality="medium",
                                     save_to=str(OUT / f"{name}.png"))
        results[name] = f"OK {time.time() - t0:.0f}s"
    except Exception as e:
        results[name] = f"FAIL {type(e).__name__}: {e}"


if __name__ == "__main__":
    with cf.ThreadPoolExecutor(max_workers=3) as ex:
        cf.wait([ex.submit(gen, n, p) for n, p in BACKGROUNDS.items()])
    print("=== generation ===")
    for k, v in sorted(results.items()):
        print(f"{'✓' if v.startswith('OK') else '✗'} {k}: {v}")
    if any(not v.startswith("OK") for v in results.values()):
        sys.exit(1)
    print("=== webp ===")
    for n in BACKGROUNDS:
        img = Image.open(OUT / f"{n}.png")
        img.save(OUT / f"{n}.webp", "WEBP", quality=82, method=6)
        print(f"✓ {n}.webp: {(OUT / f'{n}.webp').stat().st_size // 1024}KB")
    print("all done")
