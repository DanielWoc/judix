# JUDIX 2.0 · Reduce las texturas de Rocketbox y aplica la paleta oficial del Juez Woc
# (cabello negro, traje azul oscuro, camisa celeste, corbata roja).
# Uso: python texturas.py <repositorio_rocketbox> <salida> [personaje ...]
import sys, os, glob
import numpy as np
from PIL import Image
RB, OUT, SOLO = sys.argv[1], sys.argv[2], set(sys.argv[3:])
REPARTO = {  # personaje: (carpeta Rocketbox, lado de la textura de color, lado de la normal o 0)
  "woc":("Professions/Business_Male_03",1024,512), "juezM":("Professions/Business_Male_01",1024,512),
  "juezF":("Professions/Business_Female_03",1024,512), "laura":("Professions/Business_Female_01",1024,512),
  "tecM":("Professions/Business_Male_02",1024,512), "tecF":("Adults/Female_Adult_09",1024,512),
  "mag1":("Adults/Male_Adult_03",1024,512), "mag2":("Professions/Business_Female_02",1024,512), "mag3":("Professions/Business_Male_04",1024,512),
  "vega":("Professions/Business_Male_05",1024,512), "mora":("Professions/Business_Female_04",1024,512),
  "carlos":("Adults/Male_Adult_07",1024,512), "javier":("Adults/Male_Adult_08",1024,512),
  "testigo":("Professions/Construction_Male_01",1024,512),
  "pub_h1":("Adults/Male_Adult_02",512,0), "pub_h2":("Adults/Male_Adult_13",512,0),
  "pub_m1":("Adults/Female_Adult_07",512,0), "pub_m2":("Adults/Female_Adult_11",512,0)}
def lum(a): return a[...,0]*.299 + a[...,1]*.587 + a[...,2]*.114
def woc_cuerpo(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32); h, w = a.shape[:2]
    l = lum(a); sat = a.max(-1) - a.min(-1); yy, xx = np.mgrid[0:h, 0:w]
    zapatos = (yy > h*.80) & (((xx > w*.20) & (xx < w*.36)) | ((xx > w*.64) & (xx < w*.80)))
    corbata = (yy > h*.82) & (xx > w*.36) & (xx < w*.64) & (a[...,1] + a[...,2] > 2*a[...,0] + 8)
    traje = (sat < 30) & (l < 85) & ~zapatos & ~corbata
    pechera = (yy > h*.45) & (yy < h*.62) & (xx > w*.488) & (xx < w*.522) & (l > 60) & (l < 215)   # corbata dibujada en la camisa
    corbata = corbata | pechera
    camisa = (sat < 30) & (l > 90) & ~corbata
    a[traje] = np.stack([l*.40+4, l*.52+8, l*.98+24], -1)[traje]                      # azul oscuro
    a[camisa] = np.stack([l*.74, l*.84, l*.97], -1)[camisa]                          # celeste
    a[corbata] = np.stack([l*1.55+40, l*.22+8, l*.26+12], -1)[corbata]               # rojo
    return Image.fromarray(a.clip(0,255).astype(np.uint8))
def corbata_azul(im):
    # Juez del jugador: corbata azul (como su figura original) para no confundirlo con el Juez Woc.
    a = np.asarray(im.convert("RGB")).astype(np.float32); h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    m = (yy > h*.80) & (xx > w*.36) & (xx < w*.64) & (a[...,0] > a[...,1] + 30) & (a[...,0] > a[...,2] + 30)
    l = lum(a); a[m] = np.stack([l*.45+6, l*.70+14, l*1.6+30], -1)[m]
    return Image.fromarray(a.clip(0,255).astype(np.uint8))
def cabello_negro(im, zona=1.0, umbral=115):
    rgba = im.mode == "RGBA"; a = np.asarray(im.convert("RGBA" if rgba else "RGB")).astype(np.float32)
    l = lum(a); yy = np.mgrid[0:a.shape[0], 0:a.shape[1]][0]; m = (l < umbral) & (yy < a.shape[0]*zona)
    a[...,0][m] = l[m]*.38; a[...,1][m] = l[m]*.38; a[...,2][m] = l[m]*.44
    return Image.fromarray(a.clip(0,255).astype(np.uint8), "RGBA" if rgba else "RGB")
for p, (carp, lc, ln) in REPARTO.items():
    if SOLO and p not in SOLO: continue
    d = os.path.join(OUT, p); os.makedirs(d, exist_ok=True)
    for f in glob.glob(f"{RB}/Assets/Avatars/{carp}/Textures/*.tga"):
        n = os.path.basename(f)[:-4]; im = Image.open(f)
        if n.endswith("_normal"):
            if not ln: continue
            im = im.convert("RGB").resize((ln, ln), Image.LANCZOS)
        elif "opacity" in n:
            im = im.convert("RGBA").resize((512, 512), Image.LANCZOS)
            if p == "woc": im = cabello_negro(im)
        else:
            im = im.convert("RGB").resize((lc, lc), Image.LANCZOS)
            if p == "woc" and "_body" in n: im = woc_cuerpo(im)
            if p == "juezM" and "_body" in n: im = corbata_azul(im)
            if p == "woc" and "_head" in n: im = cabello_negro(im, .47, 80)
        im.save(os.path.join(d, n + ".png"))
    print(p, len(os.listdir(d)), "texturas")
