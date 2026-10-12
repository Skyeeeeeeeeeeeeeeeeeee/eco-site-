# 3D-модель кабины

`cabin-mtk-standart.glb` — модель кабины от клиента (архив `predmety-eksterera-kabina-biotualeta-580881.rar`, файл `water clozet.max`, 3ds Max). Размер 1146 × 1146 × 2303 мм, соответствует МТК Стандарт.

Как получена:
1. Blender 4.2 + расширение «Import Autodesk MAX (.max)» (io_scene_max 1.9.2): `.max` → glTF.
2. `fix-max.py` (Blender): в исходнике стенки и дверь — половинки с модификатором «Симметрия», импортёр его не применяет; скрипт добавляет зеркало по локальной X для лицевой стенки, двери и трёх боковых, удаляет неиспользуемые детали («без двери», «с начатой дверью», «крышка001»).
3. gltf-transform: `dedup`, `prune`, `quantize` (228 КБ).
4. `js/cabin-model.js` — та же модель в base64 (страница работает с диска, file:// не даёт загрузить .glb через fetch).

Библиотека: `js/vendor/three-gltf.min.js` — three.js r158 (MIT) + GLTFLoader и RoomEnvironment, собрано esbuild в один скрипт (глобальный `THREE3`).
Постер (картинка до загрузки 3D): `img/cabin-3d.png`.
