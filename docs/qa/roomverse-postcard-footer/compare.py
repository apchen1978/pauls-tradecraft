from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
import json
root=Path(__file__).resolve().parent
measurements=json.loads((root/'measurements.json').read_text())
report=[]
for after in [x for x in measurements if x['mode']=='after']:
    before=next(x for x in measurements if x['mode']=='before' and all(x[k]==after[k] for k in ['lang','viewport','dpr']))
    a=Image.open(root/before['file']).convert('RGB');b=Image.open(root/after['file']).convert('RGB')
    assert a.size==b.size
    h=after['sceneHeight']
    assert ImageChops.difference(a.crop((0,0,a.width,h)),b.crop((0,0,b.width,h))).getbbox() is None
    assert ImageChops.difference(a.crop((0,h+50,a.width,a.height)),b.crop((0,h+50,b.width,b.height))).getbbox() is None
    title,url=after['calls'];gap=url['left']-title['right'];assert gap>=10
    if after['viewport']==1440 or after['dpr']==1.25: assert ImageChops.difference(a,b).getbbox() is None
    report.append({k:after[k] for k in ['lang','viewport','dpr','width','height']}|{'header_gap_px':gap,'scene_pixels_identical':True,'footer_details_identical':True,'canvas_size_identical':True})
    if after['viewport']==390 and after['dpr']==1:
        sheet=Image.new('RGB',(a.width*2,a.height+28),'#eee9df');d=ImageDraw.Draw(sheet)
        d.text((8,8),'before',fill='black');d.text((a.width+8,8),'after',fill='black');sheet.paste(a,(0,28));sheet.paste(b,(a.width,28))
        sheet.save(root/f"comparison-{after['lang']}-390.webp",'WEBP',quality=92)
(root/'comparison.json').write_text(json.dumps(report,indent=2)+'\n')
print('Canvas size, scene and detail pixels unchanged; header has clear space')
