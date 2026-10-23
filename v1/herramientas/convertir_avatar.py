# Uso: python convertir_avatar.py <fbx> <dir_texturas_png> <salida.glb> <con_normales 0|1>
import bpy, sys, os
fbx, tdir, out = sys.argv[-4], sys.argv[-3], sys.argv[-2]  # el cuarto argumento se conserva por compatibilidad
FORMAS = {"AK_25_JawOpen":"bocaAbierta", "AA_VI_10_aa":"visemaA", "AA_VI_13_O":"visemaO", "AA_VI_01_PP":"visemaP",
          "AK_09_EyeBlinkLeft":"parpadeoI", "AK_10_EyeBlinkRight":"parpadeoD", "AK_44_MouthSmileLeft":"sonrisaI", "AK_45_MouthSmileRight":"sonrisaD"}
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx, use_anim=False)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
for o in bpy.data.objects:
    if o.type != "MESH": continue
    o.animation_data_clear()
    sk = o.data.shape_keys
    if sk:
        o.active_shape_key_index = 0
        for kb in list(sk.key_blocks)[1:]:
            if kb.name in FORMAS: kb.name = FORMAS[kb.name]
            else: o.shape_key_remove(kb)
for m in bpy.data.materials:
    if not m.node_tree: continue
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "TEX_IMAGE" or not n.image: continue
        base = os.path.basename(n.image.filepath.replace("\\", "/"))[:-4]
        png = os.path.join(tdir, base + ".png")
        if "_specular" in base or not os.path.exists(png):
            nt.nodes.remove(n); continue
        n.image = bpy.data.images.load(png, check_existing=True)
    if "opacity" in m.name: m.blend_method = "BLEND"
for img in list(bpy.data.images):
    if img.users == 0: bpy.data.images.remove(img)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="WEBP", export_image_quality=82,
    export_animations=False, export_morph=True, export_morph_normal=False, export_skins=True,
    export_texcoords=True, export_normals=True, export_tangents=False, export_materials="EXPORT", export_yup=True)
print("OK", out, os.path.getsize(out)//1024, "KB")
