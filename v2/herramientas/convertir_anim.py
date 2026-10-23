# Uso: python convertir_anim.py <fbx> <salida.glb> <nombre_clip>
import bpy, sys, os
fbx, out, nombre, paso = sys.argv[-4], sys.argv[-3], sys.argv[-2], int(sys.argv[-1])
import re
CARA = re.compile(r"Nub|Eye|Jaw|Lip|Tongue|Mouth|Masseter|Caninus|Blink|Upperlip|Cheek|Eyebrow|Nose")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx, use_anim=True)
for o in list(bpy.data.objects):
    if o.type != "ARMATURE": bpy.data.objects.remove(o, do_unlink=True)
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
act = arm.animation_data.action
for a in list(bpy.data.actions):
    if a != act: bpy.data.actions.remove(a)
act.name = nombre
for fc in list(act.fcurves):
    dp = fc.data_path
    if dp.startswith('pose.bones["'):
        hueso = dp.split('"')[1]
        if CARA.search(hueso) or dp.endswith(".scale") or (dp.endswith(".location") and hueso != "Bip01 Pelvis"): act.fcurves.remove(fc)
    elif dp == "scale": act.fcurves.remove(fc)
sc = bpy.context.scene; sc.frame_start, sc.frame_end = int(act.frame_range[0]), int(act.frame_range[1])
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_animations=True, export_animation_mode="ACTIVE_ACTIONS",
    export_force_sampling=True, export_frame_step=paso, export_optimize_animation_size=True, export_skins=False, export_materials="NONE", export_yup=True)
print("OK", nombre, round(act.frame_range[1]-act.frame_range[0]), "cuadros a", sc.render.fps, "fps", os.path.getsize(out)//1024, "KB")
