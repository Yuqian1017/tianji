# Generate Galgame visual/audio assets for Chapter 1 via toolbox APIs.
# Style anchor: traditional Chinese ink-wash + light watercolor (浅绛), muted cream/ink/gold.
# Decorative hexagram motifs in art are NOT teaching references (teaching-layer hexagrams
# are code-drawn in CastPanel). Fail loudly per item; summary at end.
import sys, time, concurrent.futures as cf
from pathlib import Path

sys.path.insert(0, "/Users/junshi/CC projects/_system/toolbox")
from clients import openai_client, elevenlabs_client  # noqa: E402

OUT = Path("/Users/junshi/CC projects/projects/games/tianji/public/assets/game")
OUT.mkdir(parents=True, exist_ok=True)

STYLE = ("Traditional Chinese ink-wash painting with light watercolor tints (浅绛 style), "
         "game background art, muted cream and ink tones with subtle gold accents, "
         "atmospheric, no people, no text, no calligraphy characters, wide composition")

BACKGROUNDS = {
    # bg-mingshitang already generated in pilot run
    "bg-shanmen": "towering ancient stone stairway of six hundred steps climbing through thick mountain mist at dawn, weathered stone gate half-visible in fog above, pine trees clinging to cliffs, a faint paper lantern glow",
    "bg-jieyindian": "interior of a quiet ancient reception hall, a long dark wooden desk with an open thick registry book and brush, morning light slanting through lattice windows, stone floor, sparse and austere",
    "bg-langting": "open-air wooden pavilion corridor beside a small herb garden of yarrow stalks, morning light, a stone table with a tiny incense burner and a potted orchid, gentle breeze feeling, distant misty peaks",
    "bg-cangjinge": "exterior of a two-story ancient library pavilion at night, many paper lanterns lighting the courtyard, one second-floor window shutter broken open, tense night atmosphere, deep blue night sky",
    "bg-shanjing": "narrow wild mountain path at night through tall grass and rocks, low ground fog, moonlight through thin clouds, a weathered waist-high boundary stone beside a fork in the trail, mysterious",
    "bg-shiku": "rocky cliff face with several shallow cave mouths at night, warm torchlight spilling from one cave entrance, scattered boulders, dark pines, dramatic chiaroscuro",
    "bg-chenguang": "wooden doors of an ancient divination hall opening onto morning light, dawn sky in pale crab-shell green-blue, mist dissolving over distant mountains, gentle hopeful atmosphere, a few morning birds",
}

PORTRAIT_BASE = ("Traditional Chinese gongbi-style character portrait with soft ink-wash shading, "
                 "full body standing pose for a visual novel, plain uniform light cream background (#f0ece4), "
                 "young Daoist divination sect disciple in simple pale grey-white robes with worn cuffs, "
                 "holding three old bronze coins, slender build, cool composed expression with a hint of "
                 "hidden warmth in the eyes, elegant, muted colors with subtle gold accent on the sash, no text")

PORTRAITS = {
    "portrait-shen-f": PORTRAIT_BASE + ", young woman, hair tied up neatly with a plain wooden hairpin, delicate pale features like a fine gongbi painting",
    "portrait-shen-m": PORTRAIT_BASE + ", young man, hair tied in a neat topknot with a plain wooden crown-pin, upright posture straight as a stone stele",
}

TITLE = {
    "title-art": ("Traditional Chinese ink-wash painting, game title screen art: a mystical mountain "
                  "sect shrouded in sea of clouds at dawn, ancient pavilions on cliff edges, three antique "
                  "bronze coins floating gently in the sky catching golden light, ethereal, majestic, "
                  "muted ink tones with gold accents, no text"),
}

BGM = {
    "bgm-main": ("Serene traditional Chinese instrumental, guzheng and xiao flute, slow and misty like "
                 "mountain fog, peaceful daoist temple morning, meditative, loopable ambient game music"),
    "bgm-mystery": ("Tense atmospheric traditional Chinese instrumental, low guqin plucks and sparse "
                    "taiko-like drum hits, night investigation mood, suspenseful but restrained, loopable game music"),
    "bgm-ritual": ("Ethereal ritual music, soft bronze bell tones, slow heartbeat-like pulse, breathy xiao "
                   "flute long notes, sacred divination ceremony atmosphere, mysterious and reverent, loopable"),
    "bgm-dawn": ("Warm gentle traditional Chinese instrumental, soft guzheng arpeggios and light strings, "
                 "dawn after a long night, quiet relief and budding tenderness, hopeful, loopable game music"),
}

results = {}

def gen_image(name, prompt, size):
    t0 = time.time()
    try:
        openai_client.generate_image(prompt, size=size, quality="medium", save_to=str(OUT / f"{name}.png"))
        results[name] = f"OK {time.time()-t0:.0f}s"
    except Exception as e:
        results[name] = f"FAIL {type(e).__name__}: {e}"

def gen_music(name, prompt):
    t0 = time.time()
    try:
        elevenlabs_client.generate_music(prompt, length_ms=60000, save_to=str(OUT / f"{name}.mp3"))
        results[name] = f"OK {time.time()-t0:.0f}s"
    except Exception as e:
        results[name] = f"FAIL {type(e).__name__}: {e}"

jobs = []
with cf.ThreadPoolExecutor(max_workers=3) as ex:
    for name, desc in BACKGROUNDS.items():
        jobs.append(ex.submit(gen_image, name, f"{STYLE}: {desc}", "1536x1024"))
    for name, prompt in PORTRAITS.items():
        jobs.append(ex.submit(gen_image, name, prompt, "1024x1536"))
    for name, prompt in TITLE.items():
        jobs.append(ex.submit(gen_image, name, prompt, "1536x1024"))
    for name, prompt in BGM.items():
        jobs.append(ex.submit(gen_music, name, prompt))
    cf.wait(jobs)

print("\n=== asset generation summary ===")
ok = sum(1 for v in results.values() if v.startswith("OK"))
for k, v in sorted(results.items()):
    print(f"{'✓' if v.startswith('OK') else '✗'} {k}: {v}")
print(f"{ok}/{len(results)} succeeded")
if ok < len(results):
    sys.exit(1)
