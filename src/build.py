import os,re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('shell.html').read().replace('/*EXTRA*/',open('extra.css').read()).replace('/*GAMECSS*/',open('game.css').read()).replace('/*MAPDATA*/',open('map_b64.txt').read())
e=open('engine.js').read().replace("'use strict';\n","",1)
e=e[:e.index("if(typeof module")] if "if(typeof module" in e else e
f=lambda x:x.replace('</script>','<\\/script>')
pre=open('i18n.js').read()+"\n"+open('icons.js').read()
out=s.replace('/*ENGINE*/',f(pre)+"\n"+f(open('audio.js').read())+"\n"+f(e)).replace('/*UI*/',f(open('ui.js').read()))
open('../index.html','w').write(out)
print(len(out))
