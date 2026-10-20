from pathlib import Path
from PIL import Image,ImageChops,ImageStat,ImageDraw
import json
root=Path(__file__).resolve().parent
report=[]
for lang,w,h in [('en',390,844),('en',390,740),('zh',390,844),('zh',390,740),('en',1440,900),('zh',1440,900)]:
    for state in ['poster','room']:
        a=Image.open(root/f'before-{lang}-{w}x{h}-{state}.webp').convert('RGB')
        b=Image.open(root/f'after-{lang}-{w}x{h}-{state}.webp').convert('RGB')
        diff=ImageChops.difference(a,b)
        unchanged=lang=='zh' or w==1440
        mean=sum(ImageStat.Stat(diff).mean)/3
        report.append(dict(lang=lang,width=w,height=h,state=state,expected_unchanged=unchanged,mean_difference=mean))
        if unchanged: assert diff.getbbox() is None,(lang,w,h,state,mean)
        if lang=='en' and w==390:
            sheet=Image.new('RGB',(w*2,h+28),'#eee9df');draw=ImageDraw.Draw(sheet)
            draw.text((8,8),'before',fill='black');draw.text((w+8,8),'after',fill='black')
            sheet.paste(a,(0,28));sheet.paste(b,(w,28));sheet.save(root/f'comparison-en-{h}-{state}.webp','WEBP',quality=90)
(root/'pixel-comparison.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print('Chinese and desktop pixel comparisons: identical')
