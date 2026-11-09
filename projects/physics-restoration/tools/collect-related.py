import tempfile
import json,urllib.request,urllib.parse,concurrent.futures,time,hashlib,re
from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
catalog=json.loads((root/'src/catalog.json').read_text());cache=Path(tempfile.gettempdir())/'physica-related';cache.mkdir(exist_ok=True)
class Related(HTMLParser):
 def __init__(self):
  super().__init__();self.anchor='';self.paragraph=None;self.a=None;self.rows=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='a' and d.get('name'):self.anchor=d['name']
  if tag=='p':self.paragraph={'anchor':self.anchor,'related':False,'links':[]}
  if tag=='img' and self.paragraph is not None and 'headword.gif' in d.get('src','').lower():self.paragraph['related']=True
  if tag=='a' and self.paragraph is not None and d.get('href'):self.a={'href':d['href'].strip(),'text':''}
 def handle_data(self,d):
  if self.a is not None:self.a['text']+=d
 def handle_endtag(self,tag):
  if tag=='a' and self.a is not None:
   if self.paragraph is not None:self.paragraph['links'].append(self.a)
   self.a=None
  if tag=='p' and self.paragraph is not None:
   if self.paragraph['related']:self.rows.append(self.paragraph)
   self.paragraph=None

def job(lesson):
 url=lesson['source'];file=cache/(lesson['id']+'.html')
 for attempt in range(3):
  try:
   raw=file.read_bytes() if file.exists() else urllib.request.urlopen(url,timeout=50).read()
   if not file.exists():file.write_bytes(raw)
   parser=Related();parser.feed(raw.decode('cp949',errors='replace'))
   rows=[]
   for r in parser.rows:
    if not r['anchor']:continue
    links=[]
    for a in r['links']:
     href=urllib.parse.urljoin(url,a['href']);label=re.sub(r'\s+',' ',a['text']).strip()
     if label and href.startswith('http://physica.gnu.ac.kr/phtml/'):
      links.append({'label':label,'source':href})
    if links:rows.append({'concept':r['anchor'],'source':url+'#'+r['anchor'],'links':links})
   return {'lessonId':lesson['id'],'source':url,'sha256':hashlib.sha256(raw).hexdigest(),'relations':rows}
  except Exception as e:
   if attempt==2:return {'lessonId':lesson['id'],'source':url,'error':str(e)}
   time.sleep(.7)
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,r in enumerate(pool.map(job,catalog['lessons'])):
  results.append(r)
  if (i+1)%50==0:print(i+1,'/',len(catalog['lessons']),flush=True)
from datetime import datetime
from zoneinfo import ZoneInfo
out={'surveyDate':datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat(),'pages':results}
(root/'src/related-links.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Pages',len(results),'errors',sum('error' in r for r in results),'blocks',sum(len(r.get('relations',[])) for r in results),flush=True)
