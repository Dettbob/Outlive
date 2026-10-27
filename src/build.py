"""Builds ../index.html (single self-contained playable file) from the sources in this folder."""
import os,re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('shell.html').read().replace('/*EXTRA*/',open('extra.css').read())
e=open('engine.js').read().replace("'use strict';\n","",1)
e=e[:e.index("if(typeof module")] if "if(typeof module" in e else e
f=lambda x:x.replace('</script>','<\\/script>')
out=s.replace('/*ENGINE*/',f(open('i18n.js').read())+"\n"+f(open('audio.js').read())+"\n"+f(e)).replace('/*UI*/',f(open('ui.js').read()))
open('../index.html','w').write(out)
print('index.html',len(out),'bytes')
