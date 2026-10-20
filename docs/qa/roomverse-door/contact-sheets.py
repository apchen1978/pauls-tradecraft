from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageStat
import json

root = Path(__file__).resolve().parent

def sheet(name, entries, columns, width):
    images = [(label, Image.open(root / file).convert('RGB')) for label, file in entries]
    height = max(round(im.height * width / im.width) for _, im in images)
    canvas = Image.new('RGB', (columns * width, ((len(images)+columns-1)//columns) * (height+28)), '#eee9df')
    draw = ImageDraw.Draw(canvas)
    for i, (label, im) in enumerate(images):
        x, y = (i % columns)*width, (i//columns)*(height+28)
        draw.text((x+8,y+7),label,fill='#332e28')
        im.thumbnail((width,height),Image.Resampling.LANCZOS)
        canvas.paste(im,(x,y+28))
    canvas.save(root / name,'WEBP',quality=88,method=6)

diffs = {}
for width in [1440,390]:
    sheet(f'before-after-{width}.webp',[(f'{mode} / {view}', f'{mode}-rain-original-{view}-{width}.webp') for mode in ['before','after'] for view in ['window','tv','door']],3,480 if width==1440 else 260)
    sheet(f'four-walls-{width}.webp',[(f'{wall} / {view}',f'after-rain-{wall}-{view}-{width}.webp') for wall in ['original','pine','stripe','botanical'] for view in ['window','door']],2,680 if width==1440 else 300)
    sheet(f'three-lights-{width}.webp',[(mood,f'after-{mood}-original-door-{width}.webp') for mood in ['rain','family','tv']],3,480 if width==1440 else 260)
    a=Image.open(root/f'before-rain-original-window-{width}.webp').convert('RGB')
    b=Image.open(root/f'after-rain-original-window-{width}.webp').convert('RGB')
    difference=ImageChops.difference(a,b)
    diffs[width]={'same_size':a.size==b.size,'mean_channel_difference_0_255':sum(ImageStat.Stat(difference).mean)/3,
                  'note':'Encoded screenshot comparison, not a pixel-invariant test; door frames cast real shadows.'}
sheet('postcards.webp',[(f'{width}px download',f'postcard-{width}.png') for width in [1440,390]],2,550)
sheet('postcard-before-after-390.webp',[(mode,f'{prefix}postcard-390.png') for mode,prefix in [('before','before-'),('after','')]],2,390)
(root/'window-view-difference.json').write_text(json.dumps(diffs,indent=2)+'\n',encoding='utf8')
