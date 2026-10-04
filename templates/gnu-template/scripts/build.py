#!/usr/bin/env python3
"""Build a self-contained GNU-theme HTML page from plain JSON.

Python 3.9+ standard library only. No AI service, network or package needed.
"""
import argparse
import base64
import html
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KINDS = ('flyer', 'seminar', 'poster', 'slides', 'web')
FONTS = {
    # family: (file, used by)
    'Noto Sans KR': ('NotoSansKR-Variable.subset.woff2', 'all'),
    'SUIT': ('SUIT-Variable.woff2', 'en'),
    'SUITE': ('SUITE-Variable.woff2', 'web'),
}
LOGOS = {
    'signature': ('assets/derived/gnu-signature.svg', '경상국립대학교'),
    'symbol': ('assets/derived/gnu-symbol.svg', '경상국립대학교'),
    'slogan': ('assets/derived/fly-with-gnu.svg', 'FLY WITH G.N.U'),
    'signature-white': ('assets/derived/emblem-signature-white.svg', '경상국립대학교'),
    'web': ('assets/official/gnu-web-logo.png', '경상국립대학교'),  # 홈페이지 헤더 원본
}
IMAGE_TYPES = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
               '.svg': 'image/svg+xml', '.webp': 'image/webp'}


class Builder:
    def __init__(self, kind, data, base, fonts='embed', output=None, no_logo=False, orientation=None):
        self.kind, self.data, self.base = kind, data, base
        self.fonts, self.output, self.no_logo = fonts, output, no_logo
        self.orientation = orientation or data.get('orientation', 'portrait')
        if self.orientation not in ('portrait', 'landscape'):
            raise SystemExit('A4 방향은 portrait 또는 landscape입니다.')
        if self.orientation == 'landscape' and kind not in ('flyer', 'seminar'):
            raise SystemExit('가로 방향은 A4 홍보문(flyer)·세미나 안내(seminar)에만 씁니다.')

    # ── text helpers ──────────────────────────────────────────
    @staticmethod
    def esc(value):
        return html.escape('' if value is None else str(value), quote=True)

    def inline(self, value):
        """Escape, then allow **bold** only. Nothing else becomes markup."""
        out = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', self.esc(value))
        return out.replace('\n', '<br>')

    def title(self, value):
        lines = [s for s in str(value or '').split('\n') if s.strip()]
        if not lines:
            return ''
        out = self.inline(lines[0])
        for extra in lines[1:]:
            out += '<span class="subtitle">' + self.inline(extra) + '</span>'
        return out

    def paragraphs(self, value):
        if isinstance(value, list):
            value = '\n\n'.join(value)
        return ''.join('<p>' + self.inline(s.strip()).replace('\n', '<br>') + '</p>'
                       for s in str(value or '').split('\n\n') if s.strip())

    def field(self, name, default=''):
        return self.inline(self.data.get(name, default))

    # ── files ─────────────────────────────────────────────────
    def resolve(self, value):
        path = Path(value)
        for candidate in (self.base / path, path, ROOT / path):
            if candidate.is_file():
                return candidate.resolve()
        raise SystemExit(f'파일을 찾을 수 없습니다: {value}')

    def image_uri(self, value):
        path = self.resolve(value)
        mime = IMAGE_TYPES.get(path.suffix.lower())
        if not mime:
            raise SystemExit(f'HTML에 넣을 수 없는 형식입니다(PNG·JPG·SVG·WebP): {value}. '
                             '.ai 원본은 scripts/derive_svg.py나 그림 도구로 SVG·PNG를 만든 뒤 사용하세요.')
        data = path.read_bytes()
        if mime == 'image/svg+xml' and re.search(rb'<script|\son\w+=|xlink:href="(?:https?:|//)', data, re.I):
            raise SystemExit(f'스크립트나 외부 참조가 있는 SVG는 넣지 않습니다: {value}')
        return f'data:{mime};base64,' + base64.b64encode(data).decode('ascii')

    def logo(self, name='signature', cls='logo'):
        file, alt = LOGOS[name]
        path = ROOT / file
        if self.no_logo or not path.exists():
            if name in ('slogan',):
                return ''
            return f'<strong class="{cls} institution">경상국립대학교</strong>'
        return f'<img class="{cls}" alt="{alt}" src="{self.image_uri(path)}">'

    def picture(self, spec, cls, alt=''):
        """Optional user image (character, QR, figure). spec: path or {src, alt}."""
        if not spec:
            return ''
        if isinstance(spec, str):
            spec = {'src': spec}
        alt = spec.get('alt', alt)
        return f'<img class="{cls}" alt="{self.esc(alt)}" src="{self.image_uri(spec["src"])}">'

    def character(self, cls):
        spec = self.data.get('character')
        if not spec:
            return ''
        if isinstance(spec, str):
            spec = {'src': spec}
        # 장식용 캐릭터는 보조기기가 읽지 않도록 빈 대체텍스트를 기본으로 한다.
        return self.picture({'src': spec['src'], 'alt': spec.get('alt', '')}, cls)

    def font_css(self):
        if self.fonts == 'system':
            return ''
        lang = self.data.get('lang', 'ko')
        rules = []
        for family, (file, use) in FONTS.items():
            if use == 'en' and (lang != 'en' or self.kind == 'web'):
                continue
            if use == 'web' and self.kind != 'web':
                continue
            path = ROOT / 'assets/fonts' / file
            if not path.exists():
                continue
            if self.fonts == 'embed':
                src = 'data:font/woff2;base64,' + base64.b64encode(path.read_bytes()).decode('ascii')
            else:
                start = (self.output.parent if self.output else ROOT).resolve()
                src = Path(os.path.relpath(path, start)).as_posix()
            rules.append("@font-face{font-family:'%s';src:url('%s') format('woff2');"
                         "font-weight:100 900;font-style:normal;font-display:block}" % (family, src))
        return ''.join(rules)

    # ── shared pieces ─────────────────────────────────────────
    def authors(self):
        items = self.data.get('authors', [])
        if isinstance(items, str):
            return self.inline(items)
        parts = []
        for a in items:
            if isinstance(a, str):
                a = {'name': a}
            sup = f'<sup>{self.esc(a["mark"])}</sup>' if a.get('mark') else ''
            cls = ' class="presenter"' if a.get('presenter') else ''
            parts.append(f'<span{cls}>{self.inline(a["name"])}{sup}</span>')
        return ', '.join(parts)

    def affiliations(self):
        items = self.data.get('affiliations', [])
        if isinstance(items, str):
            items = [items]
        out = []
        for a in items:
            if isinstance(a, str):
                a = {'name': a}
            sup = f'<sup>{self.esc(a["mark"])}</sup> ' if a.get('mark') else ''
            out.append(sup + self.inline(a['name']))
        return '<br>'.join(out)

    def qr(self):
        spec = self.data.get('qr')
        if not spec:
            return ''
        label = self.inline(spec.get('label', ''))
        if spec.get('src'):
            image = self.picture(spec, 'qr-image', spec.get('alt', 'QR 코드: ' + spec.get('url', '')))
        else:
            image = '<div class="figure-slot">[QR]</div>'
        return f'<div class="qr"><span>{label}</span>{image}</div>'

    def figure(self, item):
        if item.get('src'):
            body = self.picture(item, 'figure-image', item.get('alt', ''))
        else:
            style = f' style="min-height:{float(item["height"])}mm"' if item.get('height') else ''
            body = f'<div class="figure-slot"{style}>{self.inline(item.get("label", "[그림]"))}</div>'
        cap = f'<figcaption>{self.inline(item["caption"])}</figcaption>' if item.get('caption') else ''
        return f'<figure class="figure">{body}{cap}</figure>'

    def references(self):
        refs = self.data.get('references') or []
        if isinstance(refs, str):
            refs = [refs]
        return ('<ol class="refs">' + ''.join(f'<li>{self.inline(r)}</li>' for r in refs) + '</ol>') if refs else ''

    def identity(self):
        unit = self.data.get('unit')
        unit_html = f'<span class="unit">{self.inline(unit)}</span>' if unit else ''
        return f'<div class="identity">{self.logo("signature")}{unit_html}</div>'

    # ── kinds ─────────────────────────────────────────────────
    def wants_slogan(self):
        """FLY WITH GNU sits in A4 footers by default (fly_with_gnu, alias slogan)."""
        d = self.data
        value = d.get('fly_with_gnu', d.get('slogan', True))
        return bool(value) and not self.no_logo

    def decoration(self):
        """Opt-in approved school image or motif in the body margin (not a character)."""
        src = self.data.get('decoration_image')
        if not src:
            return ''
        img = self.picture({'src': src, 'alt': self.data.get('decoration_alt', '')}, 'decoration-image')
        return f'<div class="paper-decoration">{img}</div>'

    def facts(self, pairs, cls='facts'):
        rows = ''.join(f'<dt>{self.inline(label)}</dt><dd>{self.inline(value)}</dd>'
                       for label, value in pairs if value)
        return f'<dl class="{cls}">{rows}</dl>' if rows else ''

    def a4(self):
        d, kind = self.data, self.kind
        style = d.get('style', 'band')
        landscape = self.orientation == 'landscape'
        if kind == 'flyer':
            body = self.facts([(i['label'], i.get('value')) for i in d.get('items', [])])
            if d.get('note'):
                body += f'<div class="note">{self.paragraphs(d["note"])}</div>'
        else:
            text = f'<div class="abstract">{self.paragraphs(d.get("abstract", ""))}</div>'
            text += self.references()
            if d.get('acknowledgment'):
                text += f'<p class="ack">{self.inline(d["acknowledgment"])}</p>'
            if d.get('contact'):
                text += f'<p class="contact">{self.inline(d["contact"])}</p>'
            extra = [f'{label}: {self.inline(d[key])}' for label, key in (('대상', 'audience'), ('참여', 'participation'))
                     if d.get(key)]
            if extra and not (landscape and style != 'form'):
                text += f'<p class="contact">{" · ".join(extra)}</p>'
            if landscape and style != 'form':
                pairs = [('일시', d.get('date')), ('장소', d.get('venue')),
                         ('대상', d.get('audience')), ('참여', d.get('participation'))]
                aside = (f'<aside class="seminar-facts" aria-label="참석 안내"><h2>참석 안내</h2>'
                         f'{self.facts(pairs, "facts-list")}</aside>')
                body = f'<div class="seminar-layout"><div>{text}</div>{aside}</div>'
            else:
                body = text
        if (d.get('qr') or {}).get('src'):  # A4에는 실제 QR 이미지가 있을 때만
            body += self.qr()
        body += self.decoration()
        foot_text = ''
        if kind == 'flyer' and (d.get('organization') or d.get('contact')):
            foot_text = f'<strong>{self.field("organization")}</strong>{self.field("contact")}'
        if style == 'form':
            title = f'<h1 class="form-title">{self.title(d.get("title"))}</h1>'
            if kind == 'seminar':
                meta = ', '.join(x for x in (self.field('date'), self.field('venue')) if x)
                title = (f'<p class="form-series">{self.field("series")}</p>{title}'
                         f'<p class="form-speaker">{self.field("speaker")}</p>'
                         f'<p class="form-meta">{meta}</p>')
            text = f'<div class="foot-text">{foot_text}</div>' if foot_text else '<span></span>'
            gap = f'<div class="slogan-gap">{self.logo("slogan")}</div>' if not self.no_logo else ''
            return (f'<div class="form-frame">{gap}'
                    f'<div class="sheet-body">{title}{body}</div>{self.character("form-mascot")}</div>'
                    f'<div class="form-band">{text}{self.logo("signature-white")}</div>')
        band_cls = 'band brand' if style == 'brand' else 'band'
        if kind == 'seminar':
            when = [self.field('date')] if landscape else [self.field('date'), self.field('venue')]
            left = ', '.join(x for x in when if x)
            head = (f'<header class="{band_cls}"><div class="band-meta"><strong>{left}</strong>'
                    f'<span>{self.field("series")}</span></div><h1>{self.title(d.get("title"))}</h1>'
                    f'<p class="band-speaker">{self.field("speaker")}</p></header>')
        else:
            head = f'<header class="{band_cls}"><h1>{self.title(d.get("title"))}</h1></header>'
        slogan = self.logo('slogan', 'slogan') if self.wants_slogan() else ''
        foot = (f'<footer class="sheet-foot"><div class="foot-text">{slogan}{foot_text}</div>'
                f'{self.identity()}{self.character("mascot")}</footer>')
        return f'<div class="frame">{head}<div class="sheet-body">{body}</div>{foot}</div>'

    def poster(self):
        d = self.data
        columns = d.get('columns', [])
        cols = []
        for column in columns:
            sections = []
            for s in column:
                cls = ' class="grow"' if s.get('grow') else ''
                inner = f'<h2>{self.inline(s["heading"])}</h2>' + self.paragraphs(s.get('body', ''))
                if s.get('bullets'):
                    inner += '<ul>' + ''.join(f'<li>{self.inline(b)}</li>' for b in s['bullets']) + '</ul>'
                for f in s.get('figures', []):
                    inner += self.figure(f)
                sections.append(f'<section{cls}>{inner}</section>')
            cols.append('<div class="poster-column">' + ''.join(sections) + '</div>')
        head = (f'<header class="poster-head"><div class="gap">{self.logo("signature")}</div>'
                f'<p class="event">{self.inline(d.get("event", ""))}</p>'
                f'<h1>{self.title(d.get("title"))}</h1><div class="byline"><div>'
                f'<p class="authors">{self.authors()}</p><p class="affiliations">{self.affiliations()}</p>'
                f'</div>{self.qr()}</div></header>')
        ack = f'<p class="ack">{self.inline(d["acknowledgment"])}</p>' if d.get('acknowledgment') else ''
        foot = (f'<footer class="poster-foot"><div>{self.references()}{ack}</div><div>'
                f'<p class="contact">{self.field("contact")}</p>{self.identity()}</div>'
                f'{self.character("mascot")}</footer>')
        grid = f' style="grid-template-columns:repeat({max(1, len(columns))},1fr)"'
        return head + f'<div class="poster-body"{grid}>' + ''.join(cols) + '</div>' + foot

    def slides(self):
        d = self.data
        items = d.get('slides', [])
        out = []
        for i, s in enumerate(items, 1):
            if s.get('layout') == 'closing':
                lines = self.paragraphs(s.get('body', ''))
                body = (f'<div class="cover-frame"></div><div class="cover-body closing"><h1>{self.title(s.get("title"))}</h1>'
                        f'{lines}</div>{self.character("cover-mascot") if s.get("character") else ""}')
                out.append(f'<section class="slide cover" data-export-page aria-label="슬라이드 {i}">{body}</section>')
                continue
            if s.get('layout') == 'cover':
                body = (f'<div class="cover-frame"><div class="gap">{self.logo("signature")}</div></div>'
                        f'<div class="cover-body"><h1>{self.title(s.get("title"))}</h1>'
                        f'<p class="authors">{self.authors()}</p><p class="affiliations">{self.affiliations()}</p>'
                        f'{self.qr()}</div>{self.character("cover-mascot") if s.get("character") else ""}')
                out.append(f'<section class="slide cover" data-export-page aria-label="슬라이드 {i}">{body}</section>')
                continue
            body = f'<h2>{self.inline(s.get("title", ""))}</h2>'
            text = self.paragraphs(s.get('body', ''))
            if s.get('bullets'):
                text += '<ul>' + ''.join(f'<li>{self.inline(b)}</li>' for b in s['bullets']) + '</ul>'
            if s.get('figure'):
                body += f'<div class="two-column"><div>{text}</div>{self.figure(s["figure"])}</div>'
            else:
                body += f'<div>{text}</div>'
            body += (f'<footer class="slide-footer"><span class="who">{self.logo("symbol")}'
                     f'<span>{self.field("organization")}</span></span><span>{i} / {len(items)}</span></footer>')
            out.append(f'<section class="slide" data-export-page aria-label="슬라이드 {i}">{body}</section>')
        controls = ('<nav class="deck-controls" aria-label="발표 보기"><button type="button" id="present">발표 보기</button>'
                    '<span class="present-controls"><button type="button" id="previous" aria-label="이전 슬라이드">이전</button>'
                    '<button type="button" id="next" aria-label="다음 슬라이드">다음</button>'
                    '<button type="button" id="overview">전체 보기</button><span id="slide-status" aria-live="polite"></span>'
                    '</span><span>방향키 ← → 이동 · Esc 전체 보기</span></nav>')
        script = """<script>(()=>{const slides=[...document.querySelectorAll('.slide')];let index=0,active=false;const $=s=>document.querySelector(s);function show(n){index=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('current',i===index));$('#slide-status').textContent=(index+1)+' / '+slides.length;$('#previous').disabled=index===0;$('#next').disabled=index===slides.length-1;}function mode(v){active=v;document.body.classList.toggle('presenting',v);show(index);(v?$('#next'):$('#present')).focus();}$('#present').onclick=()=>mode(true);$('#overview').onclick=()=>mode(false);$('#previous').onclick=()=>show(index-1);$('#next').onclick=()=>show(index+1);document.addEventListener('keydown',e=>{if(!active)return;const f=['ArrowRight','PageDown',' '],b=['ArrowLeft','PageUp'];if(e.key==='Escape'){e.preventDefault();mode(false);}else if(f.includes(e.key)){e.preventDefault();show(index+1);}else if(b.includes(e.key)){e.preventDefault();show(index-1);}});show(0);})();</script>"""
        return controls + '<main class="deck">' + ''.join(out) + '</main>' + script

    def web(self):
        """대학 VI 하위 페이지형: 흰 헤더, 짙은 현재 위치 띠, 왼쪽 제목, 직사각형 하위 메뉴, 항목·본문 행."""
        d = self.data
        sections = d.get('sections', [])
        menu = [s for s in sections if s.get('in_menu', True)]
        nav = ''.join(f'<a href="#{self.esc(s["id"])}">{self.inline(s.get("menu", s["heading"]))}</a>' for s in sections)
        tabs = ''.join(f'<a href="#{self.esc(s["id"])}">{self.inline(s.get("menu", s["heading"]))}</a>' for s in menu)
        crumbs = ''.join(f'<li>{self.inline(c)}</li>' for c in d.get('location', []))
        crumbs += f'<li aria-current="page">{self.field("title")}</li>'
        banner = d.get('banner_image')  # 사용자가 사진 배너를 명시적으로 요청하고 파일을 줄 때만
        banner_style = f' style="background-image:url(\'{self.image_uri(banner)}\')"' if banner else ''
        banner_cls = 'site-banner' if banner else 'site-banner no-photo'
        body = ''
        for s in sections:
            inner = self.paragraphs(s.get('body', ''))
            if s.get('table'):
                t = s['table']
                cap = f'<caption>{self.inline(t.get("caption", ""))}</caption>' if t.get('caption') else ''
                headrow = ''.join(f'<th scope="col">{self.inline(h)}</th>' for h in t.get('columns', []))
                rows = ''.join('<tr>' + ''.join(f'<td>{self.inline(c)}</td>' for c in r) + '</tr>'
                               for r in t.get('rows', []))
                inner += (f'<div class="table-scroll" tabindex="0" role="region" aria-label="{self.esc(t.get("caption", s["heading"]))}">'
                          f'<table>{cap}<thead><tr>{headrow}</tr></thead><tbody>{rows}</tbody></table></div>')
            if s.get('links'):
                items = ''.join(f'<li><a href="{self.esc(l["url"])}">{self.inline(l["label"])}</a></li>'
                                for l in s['links'] if str(l.get('url', '')).startswith(('https://', 'http://', 'mailto:', '#')))
                inner += f'<ul>{items}</ul>'
            body += (f'<section id="{self.esc(s["id"])}" class="content-row"><h2>{self.inline(s["heading"])}</h2>'
                     f'<div class="row-body">{inner}</div></section>')
        cols = max(1, min(len(menu), 4))
        footer = (f'<footer class="site-footer"><div class="site-wrap">'
                  f'<p><strong>{self.field("organization")}</strong></p><p>{self.field("address")}</p>'
                  f'<p>{self.field("contact")}</p><p>{self.field("updated")}</p></div></footer>')
        script = """<script>(()=>{const t=document.querySelector('.menu-toggle'),n=document.querySelector('#site-nav');function close(){t.setAttribute('aria-expanded','false');n.removeAttribute('data-open');}t.onclick=()=>{const o=t.getAttribute('aria-expanded')!=='true';t.setAttribute('aria-expanded',String(o));if(o)n.setAttribute('data-open','true');else n.removeAttribute('data-open');};n.addEventListener('click',e=>{if(e.target.closest('a'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&t.getAttribute('aria-expanded')==='true'){close();t.focus();}});const p=document.querySelector('#print-page');if(p)p.onclick=()=>window.print();const links=[...document.querySelectorAll('.section-menu a')];function mark(){const h=location.hash||(links[0]&&links[0].getAttribute('href'));links.forEach(a=>{if(a.getAttribute('href')===h)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}window.addEventListener('hashchange',mark);mark();})();</script>"""
        return ('<div class="site"><a class="skip" href="#main">본문 바로가기</a>'
                f'<header class="site-header"><div class="site-wrap header-row"><a class="site-identity" href="{self.esc(d.get("home", "#"))}">'
                f'{self.logo("web", "logo web-logo")}<span class="sr-only"> {self.field("organization")} 첫 화면</span></a>'
                '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">메뉴</button>'
                f'<nav id="site-nav" class="site-nav" aria-label="주 메뉴">{nav}</nav></div></header>'
                f'<div class="{banner_cls}"{banner_style}><nav class="breadcrumb-bar" aria-label="현재 위치"><ol class="site-wrap">{crumbs}</ol></nav></div>'
                f'<main id="main" class="site-wrap" tabindex="-1"><div class="page-heading"><h1>{self.field("title")}</h1>'
                '<div class="page-tools"><button type="button" id="print-page">인쇄</button></div></div>'
                f'<nav class="section-menu" aria-label="본문 메뉴" style="--cols:{cols}">{tabs}</nav>{body}</main>{footer}</div>{script}')

    def build(self):
        kind = self.kind
        if kind in ('flyer', 'seminar'):
            cls = 'sheet a4 landscape' if self.orientation == 'landscape' else 'sheet a4'
            content, page = f'<main class="{cls}" data-export-page>{self.a4()}</main>', f'A4 {self.orientation}'
        elif kind == 'poster':
            content, page = f'<main class="sheet poster" data-export-page>{self.poster()}</main>', '841mm 1189mm'
        elif kind == 'slides':
            content, page = self.slides(), '1280px 720px'
        else:
            content, page = self.web(), None
        page_css = '@page{size:%s;margin:0}' % page if page else '@page{size:A4;margin:12mm}'
        css = (ROOT / 'assets/theme.css').read_text(encoding='utf-8')
        lang = self.esc(self.data.get('lang', 'ko'))
        title = re.sub(r'\*\*', '', str(self.data.get('title') or 'GNU 학교테마')).replace('\n', ' ')
        return ('<!doctype html>\n<html lang="' + lang + '"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1">'
                f'<meta name="gnu-template-kind" content="{kind}"><title>{self.esc(title)}</title>'
                f'<style>{self.font_css()}{css}{page_css}</style></head><body>{content}</body></html>\n')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('kind', choices=KINDS)
    p.add_argument('--data', type=Path, help='JSON 내용 파일 (기본: data/<kind>.json)')
    p.add_argument('--output', type=Path, help='HTML 저장 경로')
    p.add_argument('--fonts', choices=('embed', 'link', 'system'), default='embed',
                   help='embed: HTML 한 파일에 폰트 포함(기본), link: assets/fonts 상대경로, system: 설치된 폰트만')
    p.add_argument('--character', help='지누 등 캐릭터 PNG·SVG 경로. JSON의 character 값보다 우선')
    p.add_argument('--no-logo', action='store_true', help='로고 그림 대신 대학명 텍스트(FLY WITH GNU도 생략)')
    p.add_argument('--orientation', choices=('portrait', 'landscape'),
                   help='A4 방향(flyer·seminar). 기본은 JSON의 orientation, 없으면 portrait')
    a = p.parse_args()
    source = a.data or ROOT / 'data' / f'{a.kind}.json'
    data = json.loads(source.read_text(encoding='utf-8'))
    if a.character:
        data['character'] = {'src': str(Path(a.character).resolve())}
    suffix = '-landscape' if (a.orientation or data.get('orientation')) == 'landscape' else ''
    out = a.output or ROOT / 'out' / f'{a.kind}{suffix}.html'
    if data.get('character') and data.get('decoration_image'):
        print('주의: 캐릭터와 장식 이미지를 한 쪽에 함께 넣었습니다. DESIGN.md 6장은 하나만 쓰도록 권합니다.',
              file=sys.stderr)
    out.parent.mkdir(parents=True, exist_ok=True)
    builder = Builder(a.kind, data, source.resolve().parent, a.fonts, out, a.no_logo, a.orientation)
    out.write_text(builder.build(), encoding='utf-8')
    print(out)


if __name__ == '__main__':
    main()
