/**
 * Pluralization utility using Intl.PluralRules for Russian language
 */

class RussianPluralizer {
  constructor() {
    this.pluralRules = new Intl.PluralRules('ru-RU');
  }

  /**
   * Get the appropriate plural form for a number
   * @param {number} count - The number to pluralize
   * @param {Object} forms - Object with plural forms: {one, few, many, other}
   * @returns {string} The appropriate plural form
   */
  pluralize(count, forms) {
    const rule = this.pluralRules.select(count);
    return forms[rule] || forms.other || '';
  }

  /**
   * Format a complete phrase with number and pluralized word
   * @param {number} count - The number
   * @param {Object} forms - Object with plural forms
   * @param {string} template - Template string with {count} and {word} placeholders
   * @returns {string} The formatted phrase
   */
  format(count, forms, template = '{count} {word}') {
    const word = this.pluralize(count, forms);
    return template
      .replace('{count}', count)
      .replace('{word}', word);
  }
}

// Initialize the pluralizer
const pluralizer = new RussianPluralizer();

// Common pluralization forms
const PLURAL_FORMS = {
  drawing: {
    one: 'чертеж',
    few: 'чертежа',
    many: 'чертежей',
    other: 'чертежей'
  }
};

/**
 * Initialize pluralization for elements with data-pluralize attribute
 */
function initializePluralization() {
  document.querySelectorAll('[data-pluralize]').forEach(element => {
    const count = parseInt(element.dataset.count, 10);
    const type = element.dataset.pluralize;
    const template = element.dataset.template || '{count} {word}';

    if (PLURAL_FORMS[type]) {
      element.textContent = pluralizer.format(count, PLURAL_FORMS[type], template);
    }
  });
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePluralization);
} else {
  initializePluralization();
}
