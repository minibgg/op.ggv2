"""
Озвучка всего учебника learn.javascript.ru (ru.javascript.info) в mp3 без кода.

Что делает:
  - сам скачивает исходники учебника с GitHub (или берёт уже скачанную папку);
  - из каждой статьи выкидывает блоки кода, демо-вставки и картинки,
    а вместо них говорит короткую фразу «Пример кода пропущен» / «Схема пропущена»;
  - заметки «smart» и «warn» оставляет, это обычный текст;
  - озвучивает текст бесплатным голосом Microsoft (библиотека edge-tts)
    и раскладывает mp3 по папкам:
        learnjs/
          01 Язык программирования JavaScript/
            02 Основы JavaScript/
              01 Привет, мир!.mp3
              ...

Установка (один раз):
  pip install edge-tts

Примеры запуска:
  python js_audiobook.py                      # скачать и озвучить весь учебник
  python js_audiobook.py --list               # оглавление с путями
  python js_audiobook.py --only 1-js/06-advanced-functions
  python js_audiobook.py --only closure --voice ru-RU-DmitryNeural --rate +15%
  python js_audiobook.py --text-only          # только текст, без озвучки
  python js_audiobook.py ПАПКА_УЧЕБНИКА ...    # если учебник уже скачан вручную

Уже готовые mp3 не перезаписываются, так что прерванный запуск можно продолжить.
"""

import argparse
import asyncio
import html
import re
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path

ZIP_URL = "https://github.com/javascript-tutorial/ru.javascript.info/archive/refs/heads/master.zip"

CODE_NOTE = "Пример кода пропущен."
IMAGE_NOTE = "Схема пропущена."

# Блоки ```тип, в которых обычный текст: их читаем.
PROSE_BLOCKS = {"smart", "warn", "quote", "summary", "compare"}
# Блоки, которые не нужны на слух вообще (без фразы про код).
SILENT_BLOCKS = {"online", "offline"}
# Однострочные вставки движка учебника: [iframe ...], [codetabs ...] и т.п.
EMBED_RE = re.compile(r"^\s*\[(iframe|codetabs|js|html|edit|recent|node|user|old|get)\b")

FENCE_RE = re.compile(r"^(\s*)(`{3,})\s*([\w-]*)(.*)$")
HEADER_ATTR_RE = re.compile(r'header="([^"]*)"')


# ---------- скачивание ----------

def download_tutorial(dest: Path, refresh: bool) -> Path:
    """Скачивает zip учебника с GitHub и распаковывает из него только .md файлы."""
    root = dest / "ru.javascript.info-master"
    if refresh and dest.exists():
        shutil.rmtree(dest)
    if (root / "1-js").is_dir():
        print(f"Учебник уже скачан: {root} (обновить: --refresh)")
        return root

    dest.mkdir(parents=True, exist_ok=True)
    zip_path = dest / "tutorial.zip"
    part = dest / "tutorial.zip.part"
    print("Скачиваю учебник с GitHub...")
    try:
        with urllib.request.urlopen(ZIP_URL, timeout=60) as resp, open(part, "wb") as f:
            done = 0
            while chunk := resp.read(1 << 16):
                f.write(chunk)
                done += len(chunk)
                print(f"\r  {done / 1e6:.1f} МБ", end="", flush=True)
        print()
        part.replace(zip_path)
    except Exception as e:
        part.unlink(missing_ok=True)
        sys.exit(f"\nНе получилось скачать учебник: {e}\n"
                 f"Скачай вручную: {ZIP_URL}\n"
                 f"распакуй и передай путь к папке: python js_audiobook.py ПАПКА")

    with zipfile.ZipFile(zip_path) as z:
        top = z.namelist()[0].split("/")[0]
        for name in z.namelist():
            if name.endswith(".md"):
                z.extract(name, dest)
    zip_path.unlink()
    root = dest / top
    if not (root / "1-js").is_dir():
        sys.exit(f"В архиве не нашлось учебника: {root}")
    return root


# ---------- обход папок ----------

def sort_key(p: Path):
    m = re.match(r"(\d+)", p.name)
    return (int(m.group(1)) if m else 10**9, p.name)


def slug_of(folder: Path) -> str:
    return re.sub(r"^\d+-", "", folder.name)


def read_title(md_file: Path) -> str:
    for line in md_file.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return slug_of(md_file.parent)


def walk(folder: Path, root: Path, skip_parts):
    """Возвращает список статей по порядку: (папка статьи, [заголовки предков])."""
    result = []

    def rec(f: Path, parents):
        for child in sorted((c for c in f.iterdir() if c.is_dir()), key=sort_key):
            if child.parent == root and child.name in skip_parts:
                continue
            if not re.match(r"\d+-", child.name):
                continue
            if (child / "article.md").exists():
                result.append((child, parents))
            elif (child / "index.md").exists():
                title = read_title(child / "index.md")
                rec(child, parents + [(child, title)])

    rec(folder, [])
    return result


def build_slug_titles(root: Path) -> dict:
    titles = {}
    for md in list(root.rglob("article.md")) + list(root.rglob("index.md")):
        if md.parent == root:
            continue
        titles.setdefault(slug_of(md.parent), read_title(md))
    return titles


# ---------- markdown -> текст для озвучки ----------

def strip_front_matter(lines):
    if lines and lines[0].startswith("libs:"):
        for i, line in enumerate(lines):
            if line.strip() == "---":
                return lines[i + 1:]
    return lines


def extract_prose(md: str) -> list:
    """Проходит по строкам и выкидывает блоки кода (с учётом вложенности ```` и ```)."""
    lines = strip_front_matter(md.splitlines())
    out = []
    stack = []  # открытые блоки: (кол-во бэктиков, kind) где kind: prose / code / silent

    for line in lines:
        m = FENCE_RE.match(line)
        top = stack[-1] if stack else None

        if m:
            ticks, info, rest = len(m.group(2)), m.group(3).lower(), m.group(4)
            # Закрывающая ограда: только бэктики, не короче открывающей.
            if top and not info and not rest.strip() and ticks >= top[0]:
                stack.pop()
                if top[1] in ("prose", "compare"):
                    out.append("")
                continue
            # Внутри кода новые блоки не открываются.
            if top and top[1] in ("code", "silent"):
                continue
            # Открываем новый блок.
            if info in PROSE_BLOCKS:
                stack.append((ticks, "compare" if info == "compare" else "prose"))
                header = HEADER_ATTR_RE.search(rest)
                if header:
                    prefix = "Внимание. " if info == "warn" else ""
                    out.append(prefix + header.group(1).rstrip(".!?:") + ".")
                elif info == "warn":
                    out.append("Внимание.")
            elif info in SILENT_BLOCKS:
                stack.append((ticks, "silent"))
            else:
                stack.append((ticks, "code"))
                out.append(f"@@{CODE_NOTE}@@")
            continue

        if top and top[1] in ("code", "silent"):
            continue
        if top and top[1] == "compare":
            line = re.sub(r"^\s*\+\s+", "Плюс: ", line)
            line = re.sub(r"^\s*-\s+", "Минус: ", line)
        out.append(line)

    return out


def clean_inline(text: str, slug_titles: dict) -> str:
    # Ссылки на другие главы: <info:closure> -> «Название главы».
    def info_link(m):
        slug = m.group(1).split("#")[0].strip("/")
        title = slug_titles.get(slug.split("/")[-1])
        return f"«{title}»" if title else ""

    text = re.sub(r"<info:([^>]+)>", info_link, text)
    text = re.sub(r"\[\]\(info:([^)]+)\)", info_link, text)
    # пометки из глав про регулярные выражения: pattern:..., subject:..., match:...
    text = re.sub(r"\b(pattern|subject|match|code|pattern2):(?=\S)", "", text)

    # Код в строке: `let` -> let (прячем, чтобы не сломать подчёркивания внутри).
    codes = []

    def keep_code(m):
        c = m.group(1).replace("{...}", "фигурные скобки").replace("(...)", "круглые скобки")
        c = c.replace("[[", "").replace("]]", "")
        c = c.replace(";", "").replace("{", "").replace("}", "")
        codes.append(c)
        return f"\x00{len(codes) - 1}\x00"

    text = re.sub(r"`([^`]+)`", keep_code, text)

    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", f"@@{IMAGE_NOTE}@@", text)      # картинки
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)                    # [текст](url)
    text = re.sub(r"\[([^\]]+)\]\[[^\]]*\]", r"\1", text)                   # [текст][ref]
    text = re.sub(r"<!--.*?-->", "", text)
    text = re.sub(r"</?[a-zA-Z][^>]*>", "", text)                           # html-теги
    text = re.sub(r"https?://\S+", "", text)                                # голые ссылки
    text = re.sub(r"(\*\*|__)(.+?)\1", r"\2", text)                         # жирный
    text = re.sub(r"(?<![\w*])[*_](?!\s)(.+?)(?<!\s)[*_](?![\w*])", r"\1", text)  # курсив
    text = text.replace(" -- ", " — ")

    text = re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)
    return text


def to_speech_text(md: str, slug_titles: dict) -> str:
    out = []
    for raw in extract_prose(md):
        line = raw.strip()
        if line.startswith("@@") and line.endswith("@@"):
            out.append(line)
            continue
        if not line:
            out.append("")
            continue
        if EMBED_RE.match(line):
            out.append(f"@@{CODE_NOTE}@@")
            continue
        if re.match(r"^\[[^\]]+\]:\s*\S+", line):       # [ref]: url
            continue
        if re.match(r"^[-*_]{3,}$", line):               # горизонтальная линия
            continue
        if re.match(r"^\|?\s*:?-{3,}", line):            # разделитель таблицы
            continue

        heading = re.match(r"^#{1,6}\s+(.*)", line)
        if heading:
            line = heading.group(1).rstrip(".:") + "."
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            line = ", ".join(c for c in cells if c) + "."
        line = re.sub(r"^>\s?", "", line)                # цитата
        line = re.sub(r"^([-*+]|\d+\.)\s+", "", line)    # маркеры списков
        line = clean_inline(line, slug_titles)
        line = re.sub(r"(@@(.+?)@@)(\s*@@\2@@)+", r"\1", line)
        if line.strip():
            out.append(line)

    # Склеиваем, убираем повторяющиеся «пропущено» подряд.
    paragraphs, prev_note = [], None
    for line in out:
        note = re.fullmatch(r"\s*@@(.+?)@@\s*", line)
        if note:
            if prev_note != note.group(1):
                paragraphs.append(note.group(1))
            prev_note = note.group(1)
            continue
        if line.strip():
            prev_note = None
            line = re.sub(r"@@(.+?)@@", r" \1 ", line)
        paragraphs.append(line)

    text = "\n".join(paragraphs)
    text = html.unescape(text).replace("`", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def without_notes(text: str) -> str:
    return "\n".join(l for l in text.splitlines() if l.strip() not in (CODE_NOTE, IMAGE_NOTE)) + "\n"


# ---------- имена файлов ----------

def safe_name(s: str) -> str:
    s = s.replace("/", "-")
    s = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", s).strip(" .")
    s = re.sub(r"(\s*,)+", ",", s)
    s = re.sub(r"\s{2,}", " ", s).strip(" .,")
    return s[:90] or "untitled"


def numbered(folder: Path, title: str) -> str:
    m = re.match(r"(\d+)", folder.name)
    num = m.group(1).zfill(2) if m else ""
    return safe_name(f"{num} {title}".strip())


# ---------- озвучка ----------

async def speak(text: str, path: Path, voice: str, rate: str):
    import edge_tts

    tmp = path.parent / (path.name + ".part")
    for attempt in range(1, 6):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(str(tmp))
            tmp.replace(path)
            return
        except Exception as e:  # сеть отвалилась и т.п.
            if attempt == 5:
                tmp.unlink(missing_ok=True)
                raise
            print(f"    {path.stem}: ошибка ({e}), пробую ещё раз...")
            await asyncio.sleep(5 * attempt)


async def speak_all(jobs, voice: str, rate: str, workers: int):
    """Озвучивает несколько статей одновременно. Упавшие статьи не останавливают остальные."""
    sem = asyncio.Semaphore(workers)
    failed = []
    total = len(jobs)

    async def one(i, title, text, mp3):
        async with sem:
            print(f"[{i}/{total}] {title} ({len(text)} символов)...")
            try:
                await speak(text, mp3, voice, rate)
            except Exception as e:
                print(f"[{i}/{total}] {title}: НЕ ПОЛУЧИЛОСЬ ({e})")
                failed.append(title)

    await asyncio.gather(*(one(*job) for job in jobs))
    return failed


async def list_voices():
    import edge_tts

    for v in await edge_tts.list_voices():
        if v["Locale"].startswith(("ru-", "uk-")):
            print(f'{v["ShortName"]:28} {v["Gender"]}')


# ---------- main ----------

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    ap = argparse.ArgumentParser(description="learn.javascript.ru -> mp3 без кода")
    ap.add_argument("tutorial", type=Path, nargs="?",
                    help="папка уже скачанного учебника (если не указать, скачается сам)")
    ap.add_argument("--only", nargs="+", default=[],
                    help="какие части озвучить: путь (1-js/06-advanced-functions) или название статьи (closure)")
    ap.add_argument("--out", type=Path, default=Path("learnjs"), help="главная папка книги (по умолчанию learnjs)")
    ap.add_argument("--jobs", type=int, default=3, help="сколько статей озвучивать одновременно (по умолчанию 3)")
    ap.add_argument("--refresh", action="store_true", help="заново скачать учебник (свежая версия)")
    ap.add_argument("--voice", default="ru-RU-SvetlanaNeural", help="голос (список: --voices)")
    ap.add_argument("--rate", default="+0%", help="скорость, например +15%% или -10%%")
    ap.add_argument("--list", action="store_true", help="показать оглавление и выйти")
    ap.add_argument("--voices", action="store_true", help="показать русские и украинские голоса и выйти")
    ap.add_argument("--text-only", action="store_true", help="только сохранить .txt без озвучки (для проверки)")
    ap.add_argument("--no-notes", action="store_true", help="не говорить «Пример кода пропущен»")
    ap.add_argument("--with-archive", action="store_true",
                    help="включить разделы, которых нет на сайте: 99-archive и черновик 20-css-for-js")
    args = ap.parse_args()

    if args.voices:
        asyncio.run(list_voices())
        return

    if args.tutorial:
        root = args.tutorial.resolve()
    else:
        root = download_tutorial(Path("learnjs-source").resolve(), args.refresh)
    if not (root / "1-js").is_dir():
        sys.exit(f"Не похоже на папку учебника: {root}\nНужна папка, в которой лежат 1-js, 2-ui и т.д.")

    skip = set() if args.with_archive else {"99-archive", "20-css-for-js"}
    articles = walk(root, root, skip)
    slug_titles = build_slug_titles(root)

    def selected(folder: Path):
        if not args.only:
            return True
        rel = folder.relative_to(root).as_posix()
        return any(rel == o.strip("/") or rel.startswith(o.strip("/") + "/") or slug_of(folder) == o
                   for o in args.only)

    chosen = [(f, parents) for f, parents in articles if selected(f)]

    if args.list:
        last = None
        for f, parents in chosen:
            chain = tuple(p for p, _ in parents)
            if chain != last:
                print("\n" + " / ".join(t for _, t in parents) + f"   [{chain[-1].relative_to(root).as_posix() if chain else ''}]")
                last = chain
            print(f"    {f.relative_to(root).as_posix():55} {read_title(f / 'article.md')}")
        print(f"\nВсего статей: {len(chosen)}")
        return

    if not chosen:
        sys.exit("Ничего не найдено. Посмотри доступные пути через --list.")

    print(f"Статей: {len(chosen)}. Голос: {args.voice}, скорость {args.rate}. Папка: {args.out.resolve()}")
    jobs = []
    for i, (folder, parents) in enumerate(chosen, 1):
        title = read_title(folder / "article.md")
        out_dir = args.out.joinpath(*[numbered(p, t) for p, t in parents])
        out_dir.mkdir(parents=True, exist_ok=True)
        base = out_dir / numbered(folder, title)

        text = to_speech_text((folder / "article.md").read_text(encoding="utf-8"), slug_titles)
        if args.no_notes:
            text = without_notes(text)

        if args.text_only:
            base.parent.joinpath(base.name + ".txt").write_text(text, encoding="utf-8")
            print(f"[{i}/{len(chosen)}] {title}: текст сохранён")
            continue

        mp3 = base.parent / (base.name + ".mp3")
        if mp3.exists():
            print(f"[{i}/{len(chosen)}] {title}: уже есть, пропускаю")
            continue
        jobs.append((i, title, text, mp3))

    if jobs:
        failed = asyncio.run(speak_all(jobs, args.voice, args.rate, max(1, args.jobs)))
        if failed:
            print(f"\nНе озвучено статей: {len(failed)}. Запусти ту же команду ещё раз, готовые файлы пропустятся.")
            sys.exit(1)
    print(f"Готово. Книга лежит в {args.out.resolve()}")


if __name__ == "__main__":
    main()
