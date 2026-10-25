from __future__ import annotations
import json, math, struct, zlib
from pathlib import Path
from io import BytesIO
from PIL import Image

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)

# Small deterministic PNG materials: directional oak grain and a restrained cane weave.
def oak_texture():
    w=h=256; im=Image.new('RGB',(w,h)); px=im.load()
    for y in range(h):
        v=y/h
        for x in range(w):
            u=x/w
            grain=math.sin(v*2*math.pi*24 + math.sin(u*2*math.pi*3)*1.2)*5.2 + math.sin(v*2*math.pi*71 + math.sin(u*19)*.6)*2.1
            slow=math.sin(v*2*math.pi*4 + math.sin(u*2*math.pi)*.35)*4.0
            knot=0
            for ku,kv in ((.31,.32),(.72,.71)):
                d=((u-ku)/.13)**2+((v-kv)/.035)**2
                knot += 5*math.exp(-d)*math.sin(d*12)
            n=((x*17+y*31)%11-5)*.32
            k=grain+slow+knot+n
            px[x,y]=(max(0,min(255,int(183+k))),max(0,min(255,int(126+k*.78))),max(0,min(255,int(69+k*.55))))
    return im

def cane_texture():
    w=h=128; im=Image.new('RGB',(w,h)); p=im.load()
    for y in range(h):
        for x in range(w):
            warp=math.sin(y*.18)*1.2+math.sin(x*.16)*.7
            dx=(x+warp)%8; dy=(y+math.sin(x*.19))%8
            vertical=abs(dx-2.0)<1.55; horizontal=abs(dy-2.0)<1.55
            base=197 + ((x*13+y*7)%9-4)
            if vertical or horizontal:
                lift=21 if vertical and ((y//8)%2==0) else (8 if horizontal else 0)
                c=max(0,min(255,base+lift))
            else: c=base-18
            p[x,y]=(c,min(255,int(c*.82)),min(255,int(c*.59)))
    return im

def png_bytes(im):
    b=BytesIO(); im.save(b,format='PNG',optimize=True); return b.getvalue()

class Part:
    def __init__(self,name,material): self.name=name; self.material=material; self.p=[]; self.n=[]; self.uv=[]; self.idx=[]
    def _add(self, p, n, uv): self.p.append(tuple(p)); self.n.append(tuple(n)); self.uv.append(tuple(uv)); return len(self.p)-1
    def quad(self,a,b,c,d,uvs=None,normal=None):
        if normal is None:
            ab=[b[i]-a[i] for i in range(3)]; ac=[c[i]-a[i] for i in range(3)]
            normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
            ll=math.sqrt(sum(x*x for x in normal)) or 1; normal=[x/ll for x in normal]
        if uvs is None: uvs=((0,0),(1,0),(1,1),(0,1))
        k=[self._add(q,normal,uv) for q,uv in zip((a,b,c,d),uvs)]
        self.idx.extend((k[0],k[1],k[2],k[0],k[2],k[3]))
    def tri(self,a,b,c,uvs=None,normal=None):
        if normal is None:
            ab=[b[i]-a[i] for i in range(3)]; ac=[c[i]-a[i] for i in range(3)]
            normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
            ll=math.sqrt(sum(x*x for x in normal)) or 1; normal=[x/ll for x in normal]
        if uvs is None: uvs=((0,0),(1,0),(0,1))
        k=[self._add(q,normal,uv) for q,uv in zip((a,b,c),uvs)]; self.idx.extend(k)
    def box(self,lo,hi,grain_vertical=False):
        x0,y0,z0=lo; x1,y1,z1=hi
        faces=[
          ([(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)],(0,0,1)),
          ([(x1,y0,z0),(x0,y0,z0),(x0,y1,z0),(x1,y1,z0)],(0,0,-1)),
          ([(x1,y0,z1),(x1,y0,z0),(x1,y1,z0),(x1,y1,z1)],(1,0,0)),
          ([(x0,y0,z0),(x0,y0,z1),(x0,y1,z1),(x0,y1,z0)],(-1,0,0)),
          ([(x0,y1,z1),(x1,y1,z1),(x1,y1,z0),(x0,y1,z0)],(0,1,0)),
          ([(x0,y0,z0),(x1,y0,z0),(x1,y0,z1),(x0,y0,z1)],(0,-1,0)),]
        for pts,n in faces:
            if n[1]: uvs=((0,0),(1,0),(1,1),(0,1))
            elif grain_vertical: uvs=((.1,0),(.9,0),(.9,1),(.1,1))
            else: uvs=((0,0),(1,0),(1,1),(0,1))
            self.quad(*pts,uvs=uvs,normal=n)
    def frustum(self, bottom, top):
        # endpoints: (centerX,centerY,centerZ,width,depth); square/tapered four-leg form
        bx,by,bz,bw,bd=bottom; tx,ty,tz,tw,td=top
        def ring(cx,cy,cz,w,d): return [(cx-w/2,cy,cz-d/2),(cx+w/2,cy,cz-d/2),(cx+w/2,cy,cz+d/2),(cx-w/2,cy,cz+d/2)]
        rb=ring(bx,by,bz,bw,bd); rt=ring(tx,ty,tz,tw,td)
        self.quad(rb[0],rb[3],rb[2],rb[1],normal=(0,-1,0))
        self.quad(rt[0],rt[1],rt[2],rt[3],normal=(0,1,0))
        for i in range(4):
            j=(i+1)%4; self.quad(rb[i],rb[j],rt[j],rt[i])
    def round_slab(self,w,d,h,bevel=.012,radius=.035):
        # four rounded-rectangle loops: bottom inset, lower bevel, upper bevel, top inset
        def outline(ww,dd,r,y):
            pts=[]
            for cx,cz,start in ((ww/2-r,dd/2-r,0),(-ww/2+r,dd/2-r,90),(-ww/2+r,-dd/2+r,180),(ww/2-r,-dd/2+r,270)):
                # order is clockwise when seen from top, starting near +x,+z
                for s in range(5):
                    ang=math.radians(start+s*22.5)
                    pts.append((cx+r*math.cos(ang),y,cz+r*math.sin(ang)))
            return pts
        loops=[outline(w-2*bevel,d-2*bevel,radius*.65,0),outline(w,d,radius,bevel),outline(w,d,radius,h-bevel),outline(w-2*bevel,d-2*bevel,radius*.65,h)]
        N=len(loops[0])
        def uv(p): return (.5+p[0]/w,.5+p[2]/d)
        for q in range(3):
            for i in range(N):
                j=(i+1)%N; self.quad(loops[q][i],loops[q][j],loops[q+1][j],loops[q+1][i],uvs=(uv(loops[q][i]),uv(loops[q][j]),uv(loops[q+1][j]),uv(loops[q+1][i])))
        center=(0,h,0)
        for i in range(N):
            j=(i+1)%N; self.tri(center,loops[3][j],loops[3][i],uvs=((.5,.5),uv(loops[3][j]),uv(loops[3][i])),normal=(0,1,0))
            self.tri((0,0,0),loops[0][i],loops[0][j],uvs=((.5,.5),uv(loops[0][i]),uv(loops[0][j])),normal=(0,-1,0))
    def tube(self,a,b,r0,r1,sides=8):
        ax,ay,az=a; bx,by,bz=b
        d=[bx-ax,by-ay,bz-az]; ll=math.sqrt(sum(x*x for x in d)) or 1; d=[x/ll for x in d]
        ref=[0,0,1] if abs(d[1])>.9 else [0,1,0]
        u=[d[1]*ref[2]-d[2]*ref[1],d[2]*ref[0]-d[0]*ref[2],d[0]*ref[1]-d[1]*ref[0]]; ul=math.sqrt(sum(x*x for x in u)) or 1; u=[x/ul for x in u]
        v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
        ra=[]; rb=[]
        for i in range(sides):
            ang=2*math.pi*i/sides; ca=math.cos(ang); sa=math.sin(ang)
            off=[(u[k]*ca+v[k]*sa) for k in range(3)]
            ra.append(tuple(a[k]+off[k]*r0 for k in range(3))); rb.append(tuple(b[k]+off[k]*r1 for k in range(3)))
        self.quad(tuple(a),ra[0],ra[-1],tuple(a),normal=tuple(-q for q in d)) if False else None
        for i in range(sides):
            j=(i+1)%sides
            self.quad(ra[i],ra[j],rb[j],rb[i],uvs=((i/sides,0),(j/sides,0),(j/sides,1),(i/sides,1)))
        # caps
        self.tri(tuple(a),ra[0],ra[-1],normal=tuple(-q for q in d))
        self.tri(tuple(b),rb[-1],rb[0],normal=tuple(d))
    def curved_seat(self,w,d,y,thick):
        n=8; top=[]; bot=[]
        for j in range(n+1):
            v=j/n
            for i in range(n+1):
                u=i/n; x=(u-.5)*w; z=(v-.5)*d
                sag=.018*(1-(2*u-1)**2)*(1-(2*v-1)**2)
                top.append((x,y-sag,z)); bot.append((x,y-sag-thick,z))
        stride=n+1
        for j in range(n):
            for i in range(n):
                a=j*stride+i; b=a+1; c=a+stride+1; dd=a+stride
                self.quad(top[a],top[dd],top[c],top[b],uvs=((i/n,j/n),(i/n,(j+1)/n),((i+1)/n,(j+1)/n),((i+1)/n,j/n)))
                self.quad(bot[a],bot[b],bot[c],bot[dd],uvs=((i/n,j/n),((i+1)/n,j/n),((i+1)/n,(j+1)/n),(i/n,(j+1)/n)))
        for i in range(n):
            self.quad(top[i],bot[i],bot[i+1],top[i+1]); k=n*stride+i; self.quad(top[k+1],bot[k+1],bot[k],top[k])
        for j in range(n):
            self.quad(top[j*stride],top[(j+1)*stride],bot[(j+1)*stride],bot[j*stride]); k=j*stride+n; self.quad(top[k],bot[k],bot[k+stride],top[k+stride])
    def curved_back(self,w,h,zcenter,y0,thick):
        nx=12; ny=4; front=[]; back=[]
        for j in range(ny+1):
            v=j/ny
            for i in range(nx+1):
                u=i/nx; x=(u-.5)*w
                curve=.045*(1-(2*u-1)**2)
                y=y0+v*h + .012*(1-(2*u-1)**2)*(v-.5)
                z=zcenter+curve
                front.append((x,y,z)); back.append((x,y,z-thick))
        stride=nx+1
        for j in range(ny):
            for i in range(nx):
                a=j*stride+i; b=a+1; c=a+stride+1; dd=a+stride
                self.quad(front[a],front[b],front[c],front[dd],uvs=((i/nx,j/ny),((i+1)/nx,j/ny),((i+1)/nx,(j+1)/ny),(i/nx,(j+1)/ny)))
                self.quad(back[dd],back[c],back[b],back[a],uvs=((i/nx,(j+1)/ny),((i+1)/nx,(j+1)/ny),((i+1)/nx,j/ny),(i/nx,j/ny)))
        for i in range(nx):
            self.quad(front[i],back[i],back[i+1],front[i+1]); k=ny*stride+i; self.quad(front[k+1],back[k+1],back[k],front[k])
        for j in range(ny):
            self.quad(front[j*stride],front[(j+1)*stride],back[(j+1)*stride],back[j*stride]); k=j*stride+nx; self.quad(front[k],back[k],back[k+stride],front[k+stride])
    def sphere(self,c,r,segments=24,rings=16):
        cx,cy,cz=c; start=len(self.p)
        for j in range(rings+1):
            v=j/rings; theta=math.pi*v
            for i in range(segments+1):
                u=i/segments; phi=2*math.pi*u
                n=(math.sin(theta)*math.cos(phi),math.cos(theta),math.sin(theta)*math.sin(phi))
                self.p.append((cx+r*n[0],cy+r*n[1],cz+r*n[2])); self.n.append(n); self.uv.append((u,1-v))
        stride=segments+1
        for j in range(rings):
            for i in range(segments):
                a=start+j*stride+i; b=a+1; c=a+stride+1; d=a+stride
                self.idx.extend((a,b,c,a,c,d))
    def cylinder_y(self,cx,cy,cz,r,h,sides=20):
        y0=cy-h/2; y1=cy+h/2; bot=[]; top=[]
        for i in range(sides):
            a=2*math.pi*i/sides; co=math.cos(a); si=math.sin(a)
            bot.append((cx+r*co,y0,cz+r*si)); top.append((cx+r*co,y1,cz+r*si))
        for i in range(sides):
            j=(i+1)%sides; self.quad(bot[i],bot[j],top[j],top[i],uvs=((i/sides,0),(j/sides,0),(j/sides,1),(i/sides,1)))
            self.tri((cx,y0,cz),bot[j],bot[i],normal=(0,-1,0)); self.tri((cx,y1,cz),top[i],top[j],normal=(0,1,0))

class GLB:
    def __init__(self): self.bin=bytearray(); self.views=[]; self.accessors=[]; self.meshes=[]; self.nodes=[]; self.materials=[]; self.images=[]; self.textures=[]; self.samplers=[]
    def put(self,data,target=None):
        while len(self.bin)%4: self.bin.append(0)
        offset=len(self.bin); self.bin.extend(data); view={'buffer':0,'byteOffset':offset,'byteLength':len(data)}
        if target: view['target']=target
        self.views.append(view); return len(self.views)-1
    def add_texture(self,name,data):
        view=self.put(data); image=len(self.images); self.images.append({'name':name,'bufferView':view,'mimeType':'image/png'})
        if not self.samplers: self.samplers.append({'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497})
        tex=len(self.textures); self.textures.append({'sampler':0,'source':image,'name':name}); return tex
    def add_material(self,name,color,rough,metal=0,texture=None,emissive=None):
        mat={'name':name,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':metal,'roughnessFactor':rough}}
        if texture is not None: mat['pbrMetallicRoughness']['baseColorTexture']={'index':texture,'texCoord':0}
        if emissive: mat['emissiveFactor']=emissive
        self.materials.append(mat); return len(self.materials)-1
    def acc(self,data,ctype,typ,count,target=None,mins=None,maxs=None):
        view=self.put(data,target); a={'bufferView':view,'componentType':ctype,'count':count,'type':typ}
        if mins is not None: a['min']=mins; a['max']=maxs
        self.accessors.append(a); return len(self.accessors)-1
    def add_part(self,part,material):
        if not part.p or not part.idx: return None
        pos=struct.pack('<'+'f'*(3*len(part.p)),*(q for v in part.p for q in v))
        nor=struct.pack('<'+'f'*(3*len(part.n)),*(q for v in part.n for q in v))
        uv=struct.pack('<'+'f'*(2*len(part.uv)),*(q for v in part.uv for q in v))
        mn=[min(v[k] for v in part.p) for k in range(3)]; mx=[max(v[k] for v in part.p) for k in range(3)]
        ap=self.acc(pos,5126,'VEC3',len(part.p),34962,mn,mx); an=self.acc(nor,5126,'VEC3',len(part.n),34962); au=self.acc(uv,5126,'VEC2',len(part.uv),34962)
        idx=struct.pack('<'+'H'*len(part.idx),*part.idx); ai=self.acc(idx,5123,'SCALAR',len(part.idx),34963)
        return {'attributes':{'POSITION':ap,'NORMAL':an,'TEXCOORD_0':au},'indices':ai,'material':material,'mode':4}
    def finish(self,path,root_name,parts,root_pos=None):
        primitives=[]
        for part,material in parts:
            prim=self.add_part(part,material)
            if prim: primitives.append(prim)
        self.meshes.append({'name':root_name,'primitives':primitives})
        node={'name':root_name,'mesh':0}
        if root_pos is not None: node['translation']=root_pos
        self.nodes.append(node)
        doc={'asset':{'version':'2.0','generator':'Room 03 procedural GLB builder, guided by generated single-object references'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':self.nodes,'meshes':self.meshes,'materials':self.materials,'buffers':[{'byteLength':len(self.bin)}],'bufferViews':self.views,'accessors':self.accessors}
        if self.images: doc['images']=self.images; doc['textures']=self.textures; doc['samplers']=self.samplers
        while len(self.bin)%4: self.bin.append(0)
        js=json.dumps(doc,separators=(',',':')).encode('utf-8')
        while len(js)%4: js+=b' '
        total=12+8+len(js)+8+len(self.bin)
        out=bytearray(struct.pack('<III',0x46546c67,2,total)); out.extend(struct.pack('<II',len(js),0x4e4f534a)); out.extend(js); out.extend(struct.pack('<II',len(self.bin),0x004e4942)); out.extend(self.bin)
        path.write_bytes(out)
        verts=sum(len(p.p) for p,m in parts); tris=sum(len(p.idx)//3 for p,m in parts)
        return {'path':str(path),'bytes':len(out),'vertices':verts,'triangles':tris,'materials':len(self.materials),'meshes':len(primitives),'bboxMin':[min(p.p[i][k] for p,m in parts for i in range(len(p.p))) for k in range(3)],'bboxMax':[max(p.p[i][k] for p,m in parts for i in range(len(p.p))) for k in range(3)]}

# TABLE: 2.0 x .9 x .75 m, eased solid oak top, tapered/splayed legs, restrained rails.
g=GLB(); oak=g.add_texture('directional-oak',png_bytes(oak_texture())); wood=g.add_material('matte-oiled-oak',[1,1,1,1],.78,.02,oak)
t=Part('oak-table',wood); t.round_slab(2.0,.9,.075,.012,.045)
for i,p in enumerate(t.p): t.p[i]=(p[0],p[1]+.675,p[2])
for sx in (-1,1):
  for sz in (-1,1):
    tx=sx*.82; tz=sz*.33
    t.frustum((tx+sx*.035,.02,tz+sz*.035,.038,.038),(tx,.675,tz,.062,.062))
# Four unobtrusive apron rails, with the long rails visible from seated eye level.
for z in (-.31,.31): t.box((-0.76,.61,z-.028),(.76,.69,z+.028),grain_vertical=True)
for x in (-.75,.75): t.box((x-.028,.61,-.29),(x+.028,.69,.29),grain_vertical=True)
# A central, recessed stretcher preserves the concept's light under-table structure.
t.box((-.66,.57,-.025),(.66,.615,.025),grain_vertical=True)
table=GLB(); oak=table.add_texture('directional-oak',png_bytes(oak_texture())); wm=table.add_material('matte-oiled-oak',[1,1,1,1],.78,.02,oak)
# t currently carries previous builder's material index; rebuild material binding by matching the same geometry.
# material index 0 exists in both builders, so reuse t data.
print('TABLE',table.finish(OUT/'dining-table-v1.glb','room03-dining-table',[(t,wm)]))

# CHAIR: one 0.46 x 1.10 x 0.48 m chair; the app clones the same GLB four times.
c=GLB(); oak=c.add_texture('directional-oak',png_bytes(oak_texture())); cane=c.add_texture('woven-cane',png_bytes(cane_texture())); wood=c.add_material('matte-oak-frame',[1,1,1,1],.82,.015,oak); seatmat=c.add_material('natural-woven-cane',[1,1,1,1],.94,0,cane)
f=Part('oak-frame',wood)
# Splayed legs: front z=+; curved back posts continue to the curved broad slat.
for x in (-.18,.18):
  f.frustum((x*1.12,.02,.19,.034,.034),(x,.455,.15,.048,.048))
  f.frustum((x*1.10,.02,-.18,.034,.034),(x,.455,-.15,.05,.05))
  f.frustum((x*1.10,.02,-.18,.034,.034),(x*1.02,1.01,-.19,.038,.038))
# Seat rails and front apron.
f.box((-.205,.405,.13),(.205,.455,.17)); f.box((-.205,.405,-.17),(.205,.455,-.13))
f.box((-.205,.405,-.13),(-.165,.455,.13)); f.box((.165,.405,-.13),(.205,.455,.13))
# Two low side stretchers and a back stretcher.
f.box((-.18,.19,-.16),(-.14,.225,.16)); f.box((.14,.19,-.16),(.18,.225,.16)); f.box((-.15,.24,-.17),(.15,.275,-.13))
# Broad, gently curved horizontal backrest.
f.curved_back(.42,.18,-.18,.82,.035)
# Curved top cap rail follows the backrest contour; the broad slat stays the focal detail.
for side in (-1,1): f.tube((side*.19,.96,-.145),(side*.21,1.015,-.145),.018,.018,8)
s=Part('cane-seat',seatmat); s.curved_seat(.39,.34,.462,.025)
chair=GLB(); oak=chair.add_texture('directional-oak',png_bytes(oak_texture())); cane=chair.add_texture('woven-cane',png_bytes(cane_texture())); wood=chair.add_material('matte-oak-frame',[1,1,1,1],.82,.015,oak); seatmat=chair.add_material('natural-woven-cane',[1,1,1,1],.94,0,cane)
print('CHAIR',chair.finish(OUT/'dining-chair-v1.glb','room03-dining-chair',[(f,wood),(s,seatmat)]))

# PENDANT: opal globe, fine bronze suspension wire and ceiling canopy. Local origin is bottom of globe.
l=GLB(); bronze=l.add_material('brushed-dark-bronze',[.25,.21,.16,1],.55,.72); opal=l.add_material('warm-opal-glass',[.94,.86,.72,1],.22,.0,emissive=[.62,.45,.27])
metal=Part('bronze-parts',bronze); metal.cylinder_y(0,.64,0,.09,.025,24); metal.cylinder_y(0,.49,0,.0045,.28,8)
shade=Part('opal-globe',opal); shade.sphere((0,.16,0),.16,24,16)
print('PENDANT',l.finish(OUT/'opal-globe-pendant-v1.glb','room03-opal-globe-pendant',[(metal,bronze),(shade,opal)]))
