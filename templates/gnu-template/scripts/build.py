#!/usr/bin/env python3
"""Build self-contained GNU-theme HTML from plain JSON, without AI/service dependencies."""
import argparse
import base64
import html
import json
import mimetypes
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def text(value):
    return html.escape(str(value), quote=True)


def paragraphs(value):
    return ''.join('<p>' + text(s) + '</p>' for s in str(value).split('\n\n') if s.strip())


def image_uri(value):
    """Embed a supplied local image; relative paths use the template folder."""
    source = Path(value).expanduser()
    if not source.is_absolute():source = ROOT / source
    mime = mimetypes.guess_type(str(source))[0]
    if mime not in ('image/png','image/jpeg','image/webp','image/svg+xml'):
        raise ValueError('로컬 PNG·JPG·WebP·SVG 이미지를 지정하세요: ' + str(source))
    return 'data:' + mime + ';base64,' + base64.b64encode(source.read_bytes()).decode('ascii')


def make_document(kind, data, no_logo=False, orientation='portrait'):
    if orientation not in ('portrait', 'landscape'):
        raise ValueError('A4 방향은 portrait 또는 landscape여야 합니다.')
    if orientation == 'landscape' and kind not in ('flyer', 'seminar'):
        raise ValueError('가로 방향은 A4 홍보문·세미나 안내에만 적용합니다.')
    css = (ROOT / 'assets/theme.css').read_text(encoding='utf-8')
    # Data URI preserves the selected vector logo and makes each output portable.
    logo_path = ROOT / 'assets/derived/gnu-signature.svg'
    if not no_logo and logo_path.exists():
        uri = base64.b64encode(logo_path.read_bytes()).decode('ascii')
        logo = '<img class="logo" alt="경상국립대학교" src="data:image/svg+xml;base64,' + uri + '">'
    else:
        logo = '<strong class="institution">경상국립대학교</strong>'
    field = lambda name, default='': text(data.get(name, default))
    slogan = ''
    if kind in ('flyer', 'seminar') and not no_logo and data.get('fly_with_gnu', True):
        slogan = '<img class="fly-slogan" alt="FLY WITH G.N.U" src="' + image_uri('assets/derived/fly-with-gnu.svg') + '">'
    footer = '<footer class="paper-footer"><div class="paper-brand-row">' + slogan + logo + '</div><div class="paper-footer-info"><div class="organization">' + field('organization') + '</div><div class="small">' + field('contact') + '</div></div></footer>'
    size = 'A4 ' + orientation
    if kind in ('flyer', 'seminar'):
        meta = '<div class="meta"><span>' + field('date') + '</span><span>' + field('organization') + '</span></div>' if kind == 'seminar' else ''
        title = '<header class="band">' + meta + '<h1>' + field('title') + '</h1>'
        if kind == 'seminar':
            title += '<div class="speaker">' + field('speaker') + '</div>'
        title += '</header>'
        decoration = data.get('decoration_image')
        body = '<div class="paper-body' + (' has-decoration' if decoration else '') + '">'
        if kind == 'flyer':
            body += '<dl class="details">'
            for label, name in [('주제','subject'),('연사','speaker'),('일시','date'),('장소','venue'),('대상','audience'),('참여','participation')]:
                if data.get(name):body += '<dt>' + label + '</dt><dd>' + field(name) + '</dd>'
            body += '</dl><div class="notice">' + paragraphs(data.get('body','')) + '</div>'
        elif orientation == 'landscape':
            body += '<div class="seminar-layout"><div class="seminar-abstract">' + paragraphs(data.get('body',''))
            if data.get('references'):body += '<p class="references">' + field('references') + '</p>'
            body += '</div><aside class="seminar-facts" aria-label="참석 안내"><h2>참석 안내</h2><dl>'
            for label, name in [('일시','date'),('장소','venue'),('대상','audience'),('참여','participation')]:
                if data.get(name):body += '<dt>' + label + '</dt><dd>' + field(name) + '</dd>'
            body += '</dl></aside></div>'
        else:
            body += paragraphs(data.get('body',''))
            if data.get('references'):body += '<p class="references">' + field('references') + '</p>'
            body += '<div class="notice"><strong>일시·장소</strong><p>' + field('date') + '<br>' + field('venue') + '</p></div>'
        if decoration:
            body += '<div class="paper-decoration"><img alt="' + field('decoration_alt') + '" src="' + image_uri(decoration) + '"></div>'
        body += '</div>'
        paper_class = 'paper a4' + (' landscape' if orientation == 'landscape' else '')
        content = '<main class="' + paper_class + '" data-export-page><div class="paper-frame">' + title + body + footer + '</div></main>'
    elif kind == 'poster':
        size = '841mm 1189mm'
        head = '<header class="poster-head">' + logo + '<div class="event">' + field('event') + '</div><h1>' + field('title') + '</h1><p class="authors">' + field('authors') + '</p><p class="affiliation">' + field('affiliation') + '</p></header>'
        columns = []
        for column in data.get('columns',[]):
            sections=[]
            for section in column:
                item='<section><h2>' + text(section['heading']) + '</h2>' + paragraphs(section.get('body',''))
                if section.get('figure_label'):item += '<figure><div class="figure-slot">' + text(section['figure_label']) + '</div><figcaption class="caption">' + text(section.get('caption','')) + '</figcaption></figure>'
                sections.append(item+'</section>')
            columns.append('<div class="poster-column">'+''.join(sections)+'</div>')
        content = '<main class="paper poster" data-export-page>' + head + '<div class="poster-body">' + ''.join(columns) + '</div><footer class="poster-foot"><span>' + field('references') + '</span><span>' + field('contact') + '</span></footer></main>'
    elif kind == 'slides':
        size = '13.333333in 7.5in'
        slides=[]
        items=data.get('slides',[])
        for i,slide in enumerate(items):
            if slide.get('layout')=='cover':
                body='<div class="slide-frame"></div>' + logo + '<h1>' + text(slide['title']) + '</h1><p class="authors">' + field('authors') + '</p><p class="affiliation">' + field('affiliation') + '</p><p class="contact">' + field('contact') + '</p>'
                cls='slide cover'
            else:
                body='<h2>'+text(slide['title'])+'</h2>'
                if slide.get('layout')=='figure':
                    body+='<div class="two-column"><div>'+paragraphs(slide.get('body',''))+'</div><div><div class="figure-slot">'+text(slide.get('figure_label',''))+'</div></div></div><p class="caption">'+text(slide.get('caption',''))+'</p>'
                else:body+=paragraphs(slide.get('body',''))
                body+='<footer class="slide-footer"><span>'+field('organization')+'</span><span>'+str(i+1)+' / '+str(len(items))+'</span></footer>'
                cls='slide'
            slides.append('<section class="'+cls+'" data-export-page aria-label="슬라이드 '+str(i+1)+'">'+body+'</section>')
        controls='<nav class="deck-controls toolbar" aria-label="발표 보기"><button type="button" id="present">발표 보기</button><span class="present-controls"><button type="button" id="previous" aria-label="이전 슬라이드">이전</button><button type="button" id="next" aria-label="다음 슬라이드">다음</button><button type="button" id="overview">전체 보기</button><span id="slide-status" aria-live="polite"></span></span></nav>'
        content=controls+'<main class="deck">'+''.join(slides)+'</main>'
        content += """<script>(()=>{const slides=[...document.querySelectorAll('.slide')];let index=0,active=false;const status=document.querySelector('#slide-status');function show(n){index=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('current',i===index));status.textContent=(index+1)+' / '+slides.length;document.querySelector('#previous').disabled=index===0;document.querySelector('#next').disabled=index===slides.length-1;}function mode(value){active=value;document.body.classList.toggle('presenting',value);show(index);(value?document.querySelector('#next'):document.querySelector('#present')).focus();}document.querySelector('#present').onclick=()=>mode(true);document.querySelector('#overview').onclick=()=>mode(false);document.querySelector('#previous').onclick=()=>show(index-1);document.querySelector('#next').onclick=()=>show(index+1);document.addEventListener('keydown',e=>{if(!active)return;if(['ArrowRight','PageDown','ArrowLeft','PageUp','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape')mode(false);else show(index+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}});show(0);})();</script>"""
    else:
        rows=''.join('<tr><td>'+text(r['date'])+'</td><td>'+text(r['title'])+'</td><td>'+text(r['venue'])+'</td></tr>' for r in data.get('events',[]))
        resources=''.join('<li><a href="'+text(r['url'])+'">'+text(r['label'])+'</a></li>' for r in data.get('resources',[]) if r['url'].startswith(('https://','http://')))
        if not no_logo:
            logo = '<img class="logo web-logo" alt="경상국립대학교" src="'+image_uri('assets/official/gnu-web-logo.png')+'">'
        banner = data.get('banner_image')
        banner_style = ' style="background-image:url(\''+image_uri(banner)+'\')"' if banner else ''
        banner_class = 'site-banner' + (' no-photo' if not banner else '')
        content = '<div class="site"><a class="skip" href="#main">본문으로 바로가기</a>'
        content += '<header class="site-header"><div class="site-wrap header-row"><a class="site-identity" href="#main">'+logo+'</a><button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">메뉴</button><nav id="site-nav" class="site-nav" aria-label="주 메뉴"><a href="#intro">소개</a><a href="#events">일정</a><a href="#resources">자료</a><a href="#contact">문의</a></nav></div></header>'
        content += '<div class="'+banner_class+'"'+banner_style+'><nav class="breadcrumb-bar" aria-label="현재 위치"><ol class="site-wrap"><li><a href="#main">홈</a></li><li><a href="#intro">'+field('organization')+'</a></li><li aria-current="page">'+field('title')+'</li></ol></nav></div>'
        content += '<main id="main" class="site-wrap" tabindex="-1"><div class="page-heading"><h1>'+field('title')+'</h1><div class="page-tools"><button type="button" id="print-page">인쇄</button></div></div>'
        content += '<nav class="section-menu" aria-label="본문 메뉴"><a href="#intro" aria-current="location">소개</a><a href="#events">일정</a><a href="#resources">자료</a></nav>'
        content += '<section id="intro" class="content-row"><h2>소개</h2><div class="row-body">'+paragraphs(data.get('body',''))+'</div></section>'
        content += '<section id="events" class="content-row"><h2>일정</h2><div class="row-body"><div class="table-scroll" role="region" aria-label="행사 일정표" tabindex="0"><table><caption class="small">'+field('table_caption','학술 행사 일정')+'</caption><thead><tr><th scope="col">일시</th><th scope="col">행사</th><th scope="col">장소</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></section>'
        content += '<section id="resources" class="content-row"><h2>자료</h2><div class="row-body"><ul>'+resources+'</ul></div></section>'
        content += '<section id="contact" class="content-row"><h2>문의</h2><div class="row-body"><p>'+field('contact')+'</p></div></section></main>'
        content += '<footer class="site-footer"><div class="site-wrap">'+field('organization')+'<br>'+field('updated')+'</div></footer></div>'
        content += """<script>(()=>{const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#site-nav');function closeMenu(){toggle.setAttribute('aria-expanded','false');nav.removeAttribute('data-open');}toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));if(open)nav.setAttribute('data-open','true');else nav.removeAttribute('data-open');};nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});document.querySelector('#print-page').onclick=()=>window.print();const links=[...document.querySelectorAll('.section-menu a')];function selected(){const target=location.hash||'#intro';links.forEach(a=>{if(a.getAttribute('href')===target)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}window.addEventListener('hashchange',selected);selected();})();</script>"""
    page_css = '@page{size:'+size+';margin:0}' if kind!='web' else '@page{size:A4;margin:12mm}'
    return '<!doctype html>\n<html lang="'+text(data.get('lang','ko'))+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="gnu-template-kind" content="'+kind+'"><title>'+field('title','GNU 학교테마 템플릿')+'</title><style>'+css+page_css+'</style></head><body>'+content+'</body></html>\n'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('kind', choices=['flyer','seminar','poster','slides','web'])
    p.add_argument('--data', type=Path)
    p.add_argument('--output', type=Path)
    p.add_argument('--no-logo', action='store_true', help='Use text institution identity')
    p.add_argument('--orientation', choices=['portrait','landscape'], default='portrait',
                   help='A4 flyer/seminar direction (default: portrait)')
    a=p.parse_args()
    if a.orientation == 'landscape' and a.kind not in ('flyer','seminar'):
        p.error('--orientation landscape는 flyer 또는 seminar에서 사용하세요.')
    data=json.loads((a.data or ROOT/'data'/f'{a.kind}.json').read_text(encoding='utf-8'))
    suffix = '-landscape' if a.orientation == 'landscape' else ''
    out=a.output or ROOT/'examples'/f'{a.kind}{suffix}.html'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(make_document(a.kind,data,a.no_logo,a.orientation),encoding='utf-8')
    print(out)


if __name__=='__main__':main()
