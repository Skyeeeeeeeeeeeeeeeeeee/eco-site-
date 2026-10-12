import bpy, sys
argv=sys.argv[sys.argv.index('--')+1:]; src,out=argv[0],argv[1]; axis=argv[2] if len(argv)>2 else 'X'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for n in ['с начатой дверью','без двери','крышка001']:
  o=bpy.data.objects.get(n); bpy.data.objects.remove(o) if o else print('missing',n)
for o in bpy.data.objects:
  if o.type=='MESH': print('LOCAL',o.name,[round(min(v.co[i] for v in o.data.vertices)) for i in range(3)],[round(max(v.co[i] for v in o.data.vertices)) for i in range(3)])
for n in ['Лицевая','дверь','боковая 002','боковая 003','боковая 1']:
  o=bpy.data.objects[n]; m=o.modifiers.new('mir','MIRROR'); m.use_axis=[axis=='X',axis=='Y',axis=='Z']; m.use_mirror_merge=True; m.merge_threshold=1.0
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True)
