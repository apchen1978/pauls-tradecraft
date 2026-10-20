from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, statistics
root=Path('docs/qa/roomverse-mobile-quality')
measurements=json.loads((root/'measurements.json').read_text())
runs=measurements['runs']
(root/'measurements.json').write_text(json.dumps({'method':'390x844 Chromium, Chrome channel, device scale factor 2 and 3; CPU 1x and 4x CDP throttle; five configurations/behaviors measured once per cell. GL draw calls grouped by RAF; settled static is event-driven and has no continuous frame loop. Not physical phones.','runs':runs},indent=2))
configs=['pre97','current','antialias15','antialias175','adaptive']
labels={'pre97':'Pre-TV AA 2.0','current':'Current no-AA 1.25','antialias15':'AA 1.5','antialias175':'AA 1.75','adaptive':'Adaptive 1.25-1.75'}
font=ImageFont.load_default()
for dpr in (2,3):
  for view in ('window','tv','tour-mid'):
    cards=[]
    for c in configs:
      im=Image.open(root/f'{c}-dpr{dpr}-cpu1-{view}.webp').convert('RGB')
      cards.append(im)
    # Preserve full screenshot at a comparable width, then show a magnified edge/detail crop.
    widths=[im.width for im in cards]
    target=300
    scale=target/max(widths)
    ims=[im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS) for im in cards]
    header=28; gap=12; margin=12
    colw=max(im.width for im in ims)
    fullh=max(im.height for im in ims)
    crop_h=200 if view!='tour-mid' else 0
    height=margin*2+header+fullh+(gap+crop_h if crop_h else 0)
    sheet=Image.new('RGB',(margin*2+len(configs)*colw+(len(configs)-1)*gap,height),'#f1eee8');d=ImageDraw.Draw(sheet)
    for i,(c,im) in enumerate(zip(configs,ims)):
      x=margin+i*(colw+gap);d.text((x,margin),labels[c],fill='#222222',font=font)
      sheet.paste(im,(x,margin+header))
      if crop_h:
        src=cards[i]
        if view=='window': box=(round(src.width*.20),round(src.height*.28),round(src.width*.82),round(src.height*.73))
        else: box=(round(src.width*.18),round(src.height*.12),round(src.width*.82),round(src.height*.60))
        crop=src.crop(box); crop=crop.resize((colw,crop_h),Image.Resampling.LANCZOS)
        yy=margin+header+fullh+gap;sheet.paste(crop,(x,yy));d.rectangle((x,yy,x+colw-1,yy+crop_h-1),outline='#a99f91')
    sheet.save(root/f'contact-dpr{dpr}-{view}.webp','WEBP',quality=92,method=6)
# performance summary as compact Markdown
lines=['| Candidate | DPR | CPU | Activity | Median FPS | Minimum FPS |', '|---|---:|---:|---|---:|---:|']
for c in configs:
 for dpr in (2,3):
  for cpu in (1,4):
   r=next(x for x in runs if x['config']==c and x['dpr']==dpr and x['cpu']==cpu)
   for key,label in [('staticIdle','Static idle'),('manualRotate','Manual rotate'),('tourMid','8-sec tour mid-window')]:
    v=r[key]
    median=f"{v['p50']:.1f}" if v['p50'] is not None else 'n/a'
    minimum=f"{v['min']:.1f}" if v['min'] is not None else 'n/a'
    lines.append(f"| {c} | {dpr} | {cpu}x | {label} | {median} | {minimum} |")
(root/'fps-table.md').write_text('\n'.join(lines)+'\n')
