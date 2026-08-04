import os

def svg(w,h,bg1,bg2,label,sub,path):
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="{bg1}"/>
<stop offset="100%" stop-color="{bg2}"/>
</linearGradient>
<pattern id="jali" width="26" height="26" patternUnits="userSpaceOnUse">
<circle cx="13" cy="13" r="1.6" fill="#E0A63A" opacity="0.35"/>
</pattern>
</defs>
<rect width="{w}" height="{h}" fill="url(#g)"/>
<rect width="{w}" height="{h}" fill="url(#jali)"/>
<text x="50%" y="48%" font-family="Georgia, serif" font-size="{int(h*0.09)}" fill="#F3E7CE" text-anchor="middle" opacity="0.9">{label}</text>
<text x="50%" y="58%" font-family="Georgia, serif" font-size="{int(h*0.045)}" fill="#E0A63A" text-anchor="middle" letter-spacing="2">{sub}</text>
</svg>'''
    with open(path,'w') as f:
        f.write(content)

pairs = ["#2B0E1F,#1F4A3D","#1F4A3D,#2B0E1F","#3B1226,#22563F","#241119,#2E6B58"]

svg(900,1125,"#2B0E1F","#1F4A3D","GRAND PALACE","B A N Q U E T   H A L L","hero/hero-main.svg")
svg(1600,900,"#2B0E1F","#1F4A3D","GRAND PALACE","W E D D I N G S   ·   E V E N T S","hero/hero-wide.svg")

halls = [
 ("Maharani Hall","banquet hall"),
 ("Rajwada Court","garden banquet"),
 ("Emerald Terrace","rooftop venue"),
 ("Marigold Lawn","open lawn"),
 ("Heritage Mahal","heritage hall"),
 ("Crystal Sabha","conference banquet"),
]
for i,(name,sub) in enumerate(halls):
    p = pairs[i % len(pairs)].split(",")
    svg(800,600,p[0],p[1],name,sub.upper(),f"halls/hall-{i+1}.svg")
    svg(1200,900,p[0],p[1],name,"GALLERY VIEW",f"halls/hall-{i+1}-large.svg")

gallery_cats = ["Weddings","Birthday","Reception","Engagement","Corporate"]
for i in range(1,13):
    cat = gallery_cats[i % len(gallery_cats)]
    p = pairs[i % len(pairs)].split(",")
    svg(700,700,p[0],p[1],cat,"GRAND PALACE",f"gallery/gallery-{i}.svg")

decos = ["Royal Decoration","Floral Decoration","Traditional Decoration","Luxury Decoration"]
for i,d in enumerate(decos):
    p = pairs[i % len(pairs)].split(",")
    svg(800,600,p[0],p[1],d,"DECOR STUDIO",f"decorations/deco-{i+1}.svg")

team = ["A. Sharma","R. Verma","P. Nair","S. Iyer"]
roles = ["Founder","Events Head","Chef Partner","Decor Lead"]
for i,(t,r) in enumerate(zip(team,roles)):
    p = pairs[i % len(pairs)].split(",")
    svg(500,600,p[0],p[1],t,r.upper(),f"team/team-{i+1}.svg")

for i in range(1,5):
    p = pairs[i % len(pairs)].split(",")
    svg(200,200,p[0],p[1],"","guest",f"team/avatar-{i}.svg")

print("done")
