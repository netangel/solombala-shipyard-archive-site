// Turns a drawing's file name into a readable title for display.
//   001_БотДляМурмана_ОбщееРасположение_1945 -> Бот Для Мурмана – Общее расположение
// page.title stays the raw name: sections sort by it and search matches it.
//
// Mark up elements that hold the raw name with data-drawing-name:
//   data-drawing-name             replace the text with the title
//   data-drawing-name="alt|title" replace that attribute
//   data-drawing-name="number"    replace the text with the sheet number
//   data-drawing-name="label"     replace the text with "number · title"
//   data-drawing-name="page"      <title> tag: "raw name — site name"

(function () {
  const SEPARATOR = " – ";
  const YEAR = /^(18|19|20)\d\d$/;
  const SERIES = /^(ШР|КС|РЛ|ПОО)$/; // letter series: ШР_51_…
  const SUB_NUMBER = /^(\d{1,2}|\p{L})$/u; // 1399_1_…, 001_п_…

  // Capitalised words to keep inside a later part of the name: people, makes, places.
  const PROPER_NAME =
    /^(Мурман|Эльз|Грей[гс]|Бонжан|Клингер|Катерпил|Васильев|Букау|Вольф|Тивон|Нейше|Архангельск|Матросов|Запад$|Моряна|Касатк|Викстрем|Супериор|Граймарин|Рустон|Коммунист)/;
  const ADJECTIVE_END =
    "(?:ый|ий|ая|яя|ое|ее|ые|ие|ого|его|ой|ей|ом|ем|ых|их|ую|юю|ым|им|ным|ыми|ими)";
  const COMPOUND = new RegExp(`(\\p{L}{3,}но)(\\p{Lu})(\\p{Ll}+${ADJECTIVE_END})(?!\\p{Ll})`, "gu");

  // A sheet code has a digit and no ordinary word in it: 001а, ВН05-92-1, КМ-42б-005.
  function isCode(part) {
    return /\d/.test(part) && !/\p{Ll}{3}/u.test(part);
  }

  function splitName(raw) {
    const parts = raw
      .trim()
      .replace(/(\.(tiff?|pdf|png))+$/i, "")
      .replace(/^\((дубль|оригинал)\)/i, "")
      .replace(/_\(оригинал\)/i, "_")
      .replace(/\s*\((\d+|без нумерации)\)$/i, "")
      .replace(/_((?:18|19|20)\d\d)\(лист\s*(\d+)\)$/i, "_Лист $2_$1")
      .split("_")
      .map((part) => part.trim())
      .filter(Boolean);

    const number = [];
    if (parts.length > 1 && (isCode(parts[0]) || SERIES.test(parts[0]))) {
      // ШР_100_… and 02_4976-6_… carry a second code after the first part.
      const hasSecondCode = SERIES.test(parts[0]) || /^\d{2}$/.test(parts[0]);
      number.push(parts.shift());
      while (
        number.length < 3 &&
        parts.length > 1 &&
        (SUB_NUMBER.test(parts[0]) || (hasSecondCode && isCode(parts[0])))
      ) {
        number.push(parts.shift());
      }
    }
    while (parts.length > 1 && YEAR.test(parts[parts.length - 1])) parts.pop(); // some end _1951_1951
    return { number: number.join("-"), parts };
  }

  function separateWords(part) {
    return part
      .replace(COMPOUND, (_, first, letter, rest) => `${first}-${letter.toLowerCase()}${rest}`)
      .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2") // БотДля -> Бот Для
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2") // ВГрузовую -> В Грузовую
      .replace(/(\p{Ll}{2})(\d)/gu, "$1 $2") // Диам18 -> Диам 18; М12 stays
      .replace(/(\d)(\p{Lu}\p{Ll}|\p{Ll}{2})/gu, "$1 $2") // 17Комнат -> 17 Комнат
      .replace(/(\d)(м|т|л\.с\.)(?!\p{L})/gu, "$1 $2") // 8,8м -> 8,8 м
      .replace(/(\p{L})№/gu, "$1 №")
      .replace(/\s+/g, " ")
      .trim();
  }

  function lowerCommonWord(word) {
    const bare = word.replace(/[,.;:]$/, "");
    if (/^[ВИСКОУ]$/.test(bare)) return word.toLowerCase();
    if (/^\p{Lu}\p{Ll}+$/u.test(bare) && !PROPER_NAME.test(bare)) return word.toLowerCase();
    return word;
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // The first part names the vessel or object and keeps its capitals.
  // Later parts read as sentences.
  function formatPart(part, index) {
    const words = separateWords(part).split(" ");
    if (index === 0) return capitalize(words.join(" "));
    return capitalize([words[0], ...words.slice(1).map(lowerCommonWord)].join(" "));
  }

  function formatDrawingName(raw) {
    return splitName(raw).parts.map(formatPart).join(SEPARATOR) || raw;
  }

  function drawingNumber(raw) {
    return splitName(raw).number;
  }

  function applyTo(element) {
    const target = element.dataset.drawingName;
    if (target === "alt" || target === "title") {
      element.setAttribute(target, formatDrawingName(element.getAttribute(target)));
      return;
    }

    const raw = element.textContent.trim();
    if (target === "page") {
      const end = raw.lastIndexOf(" — ");
      if (end > 0) element.textContent = formatDrawingName(raw.slice(0, end)) + raw.slice(end);
    } else if (target === "number") {
      const number = drawingNumber(raw);
      if (number) element.textContent = number;
      else (element.closest(".spec__row") || element).remove();
    } else if (target === "label") {
      const number = drawingNumber(raw);
      element.textContent = (number ? number + " · " : "") + formatDrawingName(raw);
    } else {
      element.textContent = formatDrawingName(raw);
    }
  }

  window.formatDrawingName = formatDrawingName;
  document.querySelectorAll("[data-drawing-name]").forEach(applyTo);
})();
