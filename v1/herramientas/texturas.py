# Reduce las texturas de Rocketbox y aplica la paleta oficial del Juez Woc.
import sys, os, glob
import numpy as np
from PIL import Image
RB, OUT = sys.argv[1], sys.argv[2]
REPARTO = {  # personaje: (carpeta, lado color, lado normal o 0)
  "juez":("Professions/Business_Male_01",1024,512), "vega":("Professions/Business_Male_05",1024,512),
  "mora":("Professions/Business_Female_04",1024,512), "laura":("Professions/Business_Female_01",1024,512),
  "carlos":("Adults/Male_Adult_07",1024,512), "javier":("Adults/Male_Adult_08",1024,512),
  "testigo":("Professions/Construction_Male_01",1024,512),
  "pub_h1":("Adults/Male_Adult_02",512,0), "pub_h2":("Adults/Male_Adult_13",512,0),
  "pub_m1":("Adults/Female_Adult_07",512,0), "pub_m2":("Adults/Female_Adult_11",512,0)}
def lum(a): return a[...,0]*.299 + a[...,1]*.587 + a[...,2]*.114
def woc_traje(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32); h, w = a.shape[:2]
    l = lum(a); sat = a.max(-1) - a.min(-1)
    yy, xx = np.mgrid[0:h, 0:w]
    zapatos = (yy > h*.70) & (((xx > w*.22) & (xx < w*.40)) | ((xx > w*.60) & (xx < w*.78)))
    m = (sat < 28) & (l < 75) & ~zapatos
    navy = np.stack([l*.42+5, l*.55+9, l*1.02+27], -1)
    a[m] = navy[m]
    camisa = (sat < 30) & (l > 150)   # camisa celeste, como en la imagen oficial
    celeste = np.stack([l*.80, l*.87, l*.99], -1)
    a[camisa] = celeste[camisa]; return Image.fromarray(a.clip(0,255).astype(np.uint8))
def woc_cabello(im, zona_sup=1.0, umbral=115):
    rgba = im.mode == "RGBA"; a = np.asarray(im.convert("RGBA" if rgba else "RGB")).astype(np.float32); h = a.shape[0]
    l = lum(a); yy = np.mgrid[0:h, 0:a.shape[1]][0]
    m = (l < umbral) & (yy < h*zona_sup)
    a[...,0][m] = l[m]*.40; a[...,1][m] = l[m]*.40; a[...,2][m] = l[m]*.47
    return Image.fromarray(a.clip(0,255).astype(np.uint8), "RGBA" if rgba else "RGB")
for p, (carp, lc, ln) in REPARTO.items():
    d = os.path.join(OUT, p); os.makedirs(d, exist_ok=True)
    for f in glob.glob(f"{RB}/Assets/Avatars/{carp}/Textures/*.tga"):
        n = os.path.basename(f)[:-4]; im = Image.open(f)
        if n.endswith("_normal"):
            if not ln: continue
            im = im.convert("RGB").resize((ln, ln), Image.LANCZOS)
        elif "opacity" in n:
            im = im.convert("RGBA").resize((512, 512), Image.LANCZOS)
            if p == "juez": im = woc_cabello(im)
        else:
            im = im.convert("RGB").resize((lc, lc), Image.LANCZOS)
            if p == "juez" and "_body" in n: im = woc_traje(im)
            if p == "juez" and "_head" in n: im = woc_cabello(im, .47, 80)
        im.save(os.path.join(d, n + ".png"))
    print(p, sorted(os.listdir(d)))
