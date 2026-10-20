from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
import json
root=Path(__file__).resolve().parent;report=[]
def sheet(name,entries,cols,width):
    ims=[(label,Image.open(root/file).convert('RGB')) for label,file in entries];h=max(round(im.height*width/im.width)for _,im in ims)
    out=Image.new('RGB',(cols*width,((len(ims)+cols-1)//cols)*(h+28)),'#eee9df');d=ImageDraw.Draw(out)
    for i,(label,im)in enumerate(ims):
        x=(i%cols)*width;y=(i//cols)*(h+28);d.text((x+8,y+8),label,fill='black');im.thumbnail((width,h),Image.Resampling.LANCZOS);out.paste(im,(x,y+28))
    out.save(root/name,'WEBP',quality=90)
for width in[1440,390]:
    sheet(f'before-after-{width}.webp',[(f'{mode} / {view}',f'{mode}-rain-original-{view}-{width}.webp')for mode in['before','after']for view in['tv','side']],2,680 if width==1440 else 300)
    sheet(f'lighting-{width}.webp',[(mood,f'after-{mood}-original-tv-{width}.webp')for mood in['rain','family','tv']],3,480 if width==1440 else 260)
    sheet(f'walls-{width}.webp',[(wall,f'after-rain-{wall}-tv-{width}.webp')for wall in['original','pine','stripe','botanical']],2,680 if width==1440 else 300)
    a=Image.open(root/f'before-rain-original-window-{width}.webp').convert('RGB');b=Image.open(root/f'after-rain-original-window-{width}.webp').convert('RGB')
    scene_same=ImageChops.difference(a,b).getbbox() is None
    a=Image.open(root/f'before-postcard-{width}.png').convert('RGB');b=Image.open(root/f'after-postcard-{width}.png').convert('RGB')
    report.append(dict(viewport=width,sofa_view_identical=scene_same,postcard_size_identical=a.size==b.size,postcard_pixels_identical=ImageChops.difference(a,b).getbbox() is None))
    assert scene_same and a.size==b.size and ImageChops.difference(a,b).getbbox() is None
im=Image.open(root/'after-rain-original-tv-1440.webp');im.crop((380,380,980,620)).save(root/'console-native-crop.webp','WEBP',lossless=True)
(root/'comparison.json').write_text(json.dumps(report,indent=2)+'\n');print('Sofa views and postcards identical; contact sheets ready')
