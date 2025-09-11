import { EventEmitter } from 'events';

/**
 * Types de formats de date
 */
export enum DateFormat {
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD_YYYY = 'MM/DD/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
  DD_MM_YY = 'DD/MM/YY',
  MM_DD_YY = 'MM/DD/YY',
  YY_MM_DD = 'YY-MM-DD',
  DD_MMMM_YYYY = 'DD MMMM YYYY',
  MMMM_DD_YYYY = 'MMMM DD, YYYY',
  DD_MM_YYYY_HH_MM = 'DD/MM/YYYY HH:mm',
  YYYY_MM_DD_HH_MM = 'YYYY-MM-DD HH:mm'
}

/**
 * Types de formats d'heure
 */
export enum TimeFormat {
  HH_MM = 'HH:mm',
  HH_MM_SS = 'HH:mm:ss',
  HH_MM_A = 'hh:mm A',
  HH_MM_SS_A = 'hh:mm:ss A',
  H_MM = 'H:mm',
  H_MM_SS = 'H:mm:ss'
}

/**
 * Interface pour les traductions
 */
export interface Translation {
  key: string;
  value: string;
  locale: string;
  namespace?: string;
  context?: string;
  plural?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface pour les paramètres régionaux
 */
export interface LocaleSettings {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
    currency: string;
    currencyPosition: 'before' | 'after';
  };
  weekStart: number; // 0 = dimanche, 1 = lundi, etc.
  timezone: string;
}

/**
 * Interface pour les options du service i18n
 */
export interface ViewI18nOptions {
  defaultLocale?: string;
  fallbackLocale?: string;
  enableBrowserDetection?: boolean;
  enableLocalStorage?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
  debug?: boolean;
}

/**
 * Service d'internationalisation pour les vues Entidr
 * Gère les traductions, les formats locaux et les paramètres régionaux
 */
export class EntidrViewI18nService extends EventEmitter {
  private translations: Map<string, Translation[]> = new Map();
  private locales: Map<string, LocaleSettings> = new Map();
  private currentLocale: string;
  private fallbackLocale: string;
  private cache: Map<string, { value: string; timestamp: number }> = new Map();
  private options: Required<ViewI18nOptions>;

  constructor(options: ViewI18nOptions = {}) {
    super();

    this.options = {
      defaultLocale: options.defaultLocale || 'fr',
      fallbackLocale: options.fallbackLocale || 'en',
      enableBrowserDetection: options.enableBrowserDetection ?? true,
      enableLocalStorage: options.enableLocalStorage ?? true,
      enableCache: options.enableCache ?? true,
      cacheTTL: options.cacheTTL || 300000, // 5 minutes
      debug: options.debug || false
    };

    this.currentLocale = this.options.defaultLocale;
    this.fallbackLocale = this.options.fallbackLocale;

    // Initialiser les paramètres régionaux par défaut
    this.initializeDefaultLocales();

    // Configurer les écouteurs d'événements
    this.setupEventListeners();

    // Détecter la langue du navigateur si activé
    if (this.options.enableBrowserDetection && typeof window !== 'undefined') {
      this.detectBrowserLanguage();
    }

    // Charger depuis le localStorage si activé
    if (this.options.enableLocalStorage && typeof localStorage !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Définit la langue actuelle
   */
  setLocale(locale: string): void {
    if (!this.locales.has(locale)) {
      console.warn(`[ViewI18nService] Locale ${locale} not found, falling back to ${this.fallbackLocale}`);
      locale = this.fallbackLocale;
    }

    const previousLocale = this.currentLocale;
    this.currentLocale = locale;

    // Vider le cache lorsque la langue change
    this.cache.clear();

    // Sauvegarder dans le localStorage si activé
    if (this.options.enableLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.setItem('entidr_locale', locale);
    }

    if (this.options.debug) {
      console.log(`[ViewI18nService] Locale changed from ${previousLocale} to ${locale}`);
    }

    this.emit('localeChanged', { previous: previousLocale, current: locale });
  }

  /**
   * Récupère la langue actuelle
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Récupère les paramètres régionaux actuels
   */
  getCurrentLocaleSettings(): LocaleSettings {
    return this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!;
  }

  /**
   * Traduit une clé
   */
  translate(
    key: string,
    params?: Record<string, any>,
    locale?: string,
    namespace?: string
  ): string {
    const targetLocale = locale || this.currentLocale;

    // Vérifier le cache si activé
    const cacheKey = this.generateCacheKey(key, targetLocale, namespace, params);
    if (this.options.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.options.cacheTTL) {
        return cached.value;
      }
    }

    // Rechercher la traduction
    let translation = this.findTranslation(key, targetLocale, namespace);

    // Si non trouvée, utiliser la langue de repli
    if (!translation && targetLocale !== this.fallbackLocale) {
      translation = this.findTranslation(key, this.fallbackLocale, namespace);
    }

    // Si toujours non trouvée, retourner la clé
    let result = translation || key;

    // Appliquer les paramètres
    if (params && typeof result === 'string') {
      result = this.interpolateParams(result, params);
    }

    // Mettre en cache le résultat
    if (this.options.enableCache) {
      this.cache.set(cacheKey, {
        value: result,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Traduit au pluriel
   */
  translatePlural(
    key: string,
    count: number,
    params?: Record<string, any>,
    locale?: string,
    namespace?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    const pluralKey = this.getPluralKey(key, count, targetLocale);

    // Ajouter le count aux paramètres
    const pluralParams = { ...params, count };

    return this.translate(pluralKey, pluralParams, targetLocale, namespace);
  }

  /**
   * Formate une date selon les paramètres régionaux
   */
  formatDate(
    date: Date | string | number,
    format?: DateFormat,
    locale?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    const localeSettings = this.locales.get(targetLocale) || this.locales.get(this.fallbackLocale)!;
    const dateFormat = format || localeSettings.dateFormat;

    const dateObj = new Date(date);

    // Formater selon le format demandé
    switch (dateFormat) {
      case DateFormat.DD_MM_YYYY:
        return this.formatDateParts(dateObj, 'DD', 'MM', 'YYYY', targetLocale);
      case DateFormat.MM_DD_YYYY:
        return this.formatDateParts(dateObj, 'MM', 'DD', 'YYYY', targetLocale);
      case DateFormat.YYYY_MM_DD:
        return this.formatDateParts(dateObj, 'YYYY', 'MM', 'DD', targetLocale);
      case DateFormat.DD_MM_YY:
        return this.formatDateParts(dateObj, 'DD', 'MM', 'YY', targetLocale);
      case DateFormat.MM_DD_YY:
        return this.formatDateParts(dateObj, 'MM', 'DD', 'YY', targetLocale);
      case DateFormat.YY_MM_DD:
        return this.formatDateParts(dateObj, 'YY', 'MM', 'DD', targetLocale);
      case DateFormat.DD_MMMM_YYYY:
        return this.formatDateParts(dateObj, 'DD', 'MMMM', 'YYYY', targetLocale);
      case DateFormat.MMMM_DD_YYYY:
        return this.formatDateParts(dateObj, 'MMMM', 'DD', 'YYYY', targetLocale);
      case DateFormat.DD_MM_YYYY_HH_MM:
        return `${this.formatDateParts(dateObj, 'DD', 'MM', 'YYYY', targetLocale)} ${this.formatTime(dateObj, undefined, targetLocale)}`;
      case DateFormat.YYYY_MM_DD_HH_MM:
        return `${this.formatDateParts(dateObj, 'YYYY', 'MM', 'DD', targetLocale)} ${this.formatTime(dateObj, undefined, targetLocale)}`;
      default:
        return dateObj.toLocaleDateString(targetLocale);
    }
  }

  /**
   * Formate une heure selon les paramètres régionaux
   */
  formatTime(
    time: Date | string | number,
    format?: TimeFormat,
    locale?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    const localeSettings = this.locales.get(targetLocale) || this.locales.get(this.fallbackLocale)!;
    const timeFormat = format || localeSettings.timeFormat;

    const timeObj = new Date(time);

    // Formater selon le format demandé
    switch (timeFormat) {
      case TimeFormat.HH_MM:
        return this.formatTimeParts(timeObj, 'HH', 'mm', targetLocale);
      case TimeFormat.HH_MM_SS:
        return this.formatTimeParts(timeObj, 'HH', 'mm', targetLocale, 'ss');
      case TimeFormat.HH_MM_A:
        return this.formatTimeParts(timeObj, 'hh', 'mm', targetLocale, undefined, 'A');
      case TimeFormat.HH_MM_SS_A:
        return this.formatTimeParts(timeObj, 'hh', 'mm', targetLocale, 'ss', 'A');
      case TimeFormat.H_MM:
        return this.formatTimeParts(timeObj, 'H', 'mm', targetLocale);
      case TimeFormat.H_MM_SS:
        return this.formatTimeParts(timeObj, 'H', 'mm', targetLocale, 'ss');
      default:
        return timeObj.toLocaleTimeString(targetLocale);
    }
  }

  /**
   * Formate un nombre selon les paramètres régionaux
   */
  formatNumber(
    number: number,
    precision?: number,
    locale?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    const localeSettings = this.locales.get(targetLocale) || this.locales.get(this.fallbackLocale)!;
    const numberFormat = localeSettings.numberFormat;

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: precision ?? numberFormat.precision,
      maximumFractionDigits: precision ?? numberFormat.precision
    };

    return new Intl.NumberFormat(targetLocale, options).format(number);
  }

  /**
   * Formate une devise selon les paramètres régionaux
   */
  formatCurrency(
    amount: number,
    currency?: string,
    locale?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    const localeSettings = this.locales.get(targetLocale) || this.locales.get(this.fallbackLocale)!;
    const numberFormat = localeSettings.numberFormat;

    const targetCurrency = currency || numberFormat.currency;

    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: numberFormat.precision,
      maximumFractionDigits: numberFormat.precision
    };

    return new Intl.NumberFormat(targetLocale, options).format(amount);
  }

  /**
   * Ajoute des traductions
   */
  addTranslations(translations: Translation[]): void {
    for (const translation of translations) {
      const locale = translation.locale;
      if (!this.translations.has(locale)) {
        this.translations.set(locale, []);
      }

      // Vérifier si la traduction existe déjà
      const existingIndex = this.translations.get(locale)!.findIndex(
        t => t.key === translation.key && t.namespace === translation.namespace
      );

      if (existingIndex >= 0) {
        // Mettre à jour la traduction existante
        this.translations.get(locale)![existingIndex] = translation;
      } else {
        // Ajouter la nouvelle traduction
        this.translations.get(locale)!.push(translation);
      }
    }

    // Vider le cache
    this.cache.clear();

    if (this.options.debug) {
      console.log(`[ViewI18nService] Added ${translations.length} translations`);
    }

    this.emit('translationsAdded', translations);
  }

  /**
   * Ajoute des paramètres régionaux
   */
  addLocale(locale: LocaleSettings): void {
    this.locales.set(locale.code, locale);

    if (this.options.debug) {
      console.log(`[ViewI18nService] Added locale: ${locale.name} (${locale.code})`);
    }

    this.emit('localeAdded', locale);
  }

  /**
   * Récupère toutes les langues disponibles
   */
  getAvailableLocales(): LocaleSettings[] {
    return Array.from(this.locales.values());
  }

  /**
   * Récupère les traductions pour une langue
   */
  getTranslations(locale: string, namespace?: string): Translation[] {
    const translations = this.translations.get(locale) || [];

    if (namespace) {
      return translations.filter(t => t.namespace === namespace);
    }

    return translations;
  }

  /**
   * Exporte les traductions au format JSON
   */
  exportTranslations(locale?: string): string {
    const data: any = {};

    if (locale) {
      data[locale] = this.getTranslations(locale);
    } else {
      for (const [localeCode] of this.translations) {
        data[localeCode] = this.getTranslations(localeCode);
      }
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Importe les traductions depuis un format JSON
   */
  importTranslations(jsonData: string): { success: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const result = { success: 0, errors: [] as string[] };

      for (const [locale, translations] of Object.entries(data)) {
        try {
          this.addTranslations(translations as Translation[]);
          result.success += (translations as Translation[]).length;
        } catch (error) {
          result.errors.push(`Erreur avec la langue ${locale}: ${error instanceof Error ? error.message : error}`);
        }
      }

      if (this.options.debug) {
        console.log(`[ViewI18nService] Imported ${result.success} translations with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      const errorMessage = `Erreur de parsing JSON: ${error instanceof Error ? error.message : error}`;

      if (this.options.debug) {
        console.error(`[ViewI18nService] ${errorMessage}`);
      }

      return { success: 0, errors: [errorMessage] };
    }
  }

  /**
   * Crée un hook React pour l'internationalisation
   */
  createI18nHook() {
    const self = this;

    return {
      /**
       * Hook pour la traduction
       */
      useTranslation: (namespace?: string) => {
        return {
          t: (key: string, params?: Record<string, any>) =>
            self.translate(key, params, undefined, namespace),
          tPlural: (key: string, count: number, params?: Record<string, any>) =>
            self.translatePlural(key, count, params, undefined, namespace),
          locale: self.currentLocale,
          setLocale: (locale: string) => self.setLocale(locale)
        };
      },

      /**
       * Hook pour le formatage
       */
      useFormat: () => {
        return {
          formatDate: (date: Date | string | number, format?: DateFormat) =>
            self.formatDate(date, format),
          formatTime: (time: Date | string | number, format?: TimeFormat) =>
            self.formatTime(time, format),
          formatNumber: (number: number, precision?: number) =>
            self.formatNumber(number, precision),
          formatCurrency: (amount: number, currency?: string) =>
            self.formatCurrency(amount, currency)
        };
      },

      /**
       * Hook pour les paramètres régionaux
       */
      useLocale: () => {
        return {
          locale: self.currentLocale,
          localeSettings: self.getCurrentLocaleSettings(),
          availableLocales: self.getAvailableLocales(),
          setLocale: (locale: string) => self.setLocale(locale)
        };
      }
    };
  }

  /**
   * Recherche une traduction
   */
  private findTranslation(key: string, locale: string, namespace?: string): string | null {
    const translations = this.translations.get(locale);
    if (!translations) {
      return null;
    }

    const translation = translations.find(
      t => t.key === key && (!namespace || t.namespace === namespace)
    );

    return translation?.value || null;
  }

  /**
   * Génère une clé de cache
   */
  private generateCacheKey(
    key: string,
    locale: string,
    namespace?: string,
    params?: Record<string, any>
  ): string {
    const namespacePart = namespace ? `${namespace}:` : '';
    const paramsPart = params ? `:${JSON.stringify(params)}` : '';
    return `${locale}:${namespacePart}${key}${paramsPart}`;
  }

  /**
   * Interpole les paramètres dans une chaîne
   */
  private interpolateParams(text: string, params: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Détermine la clé de pluriel
   */
  private getPluralKey(key: string, count: number, locale: string): string {
    // Logique simple de pluriel - peut être étendue pour des règles plus complexes
    const pluralRules = {
      fr: count > 1 ? `${key}_plural` : key,
      en: count !== 1 ? `${key}_plural` : key,
      es: count !== 1 ? `${key}_plural` : key,
      de: count !== 1 ? `${key}_plural` : key,
      it: count !== 1 ? `${key}_plural` : key,
      pt: count !== 1 ? `${key}_plural` : key,
      ru: this.getRussianPluralForm(count, key),
      ar: this.getArabicPluralForm(count, key),
      zh: key, // Le chinois n'a pas de pluriel
      ja: key  // Le japonais n'a pas de pluriel
    };

    return pluralRules[locale as keyof typeof pluralRules] || key;
  }

  /**
   * Forme plurielle russe (complexe)
   */
  private getRussianPluralForm(count: number, key: string): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 14) {
      return `${key}_plural_many`;
    } else if (mod10 === 1) {
      return key;
    } else if (mod10 >= 2 && mod10 <= 4) {
      return `${key}_plural_few`;
    } else {
      return `${key}_plural_many`;
    }
  }

  /**
   * Forme plurielle arabe (complexe)
   */
  private getArabicPluralForm(count: number, key: string): string {
    if (count === 0) {
      return `${key}_plural_zero`;
    } else if (count === 1) {
      return key;
    } else if (count === 2) {
      return `${key}_plural_two`;
    } else if (count % 100 >= 3 && count % 100 <= 10) {
      return `${key}_plural_few`;
    } else {
      return `${key}_plural_many`;
    }
  }

  /**
   * Formate les parties de date
   */
  private formatDateParts(date: Date, dayPart: string, monthPart: string, yearPart: string, locale: string): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const dayStr = day < 10 ? `0${day}` : day;
    const monthStr = month < 10 ? `0${month}` : month;
    const yearStr = year;
    const yearShortStr = year.toString().slice(-2);

    // Noms des mois
    const monthNames = {
      fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
      pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    };

    const monthName = monthNames[locale as keyof typeof monthNames]?.[month - 1] || monthNames.fr[month - 1];

    return `${dayPart === 'DD' ? dayStr : day}${monthPart === 'MMMM' ? monthName : monthPart === 'MM' ? monthStr : month}${yearPart === 'YYYY' ? yearStr : yearShortStr}`;
  }

  /**
   * Formate les parties d'heure
   */
  private formatTimeParts(date: Date, hourPart: string, minutePart: string, locale: string, secondPart?: string, ampmPart?: string): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hours24 = hours;
    const hours12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';

    const hourStr = hourPart === 'HH' || hourPart === 'hh' ?
      (hourPart === 'HH' ? hours24 : hours12) < 10 ? `0${hourPart === 'HH' ? hours24 : hours12}` : hourPart === 'HH' ? hours24 : hours12 :
      hourPart === 'H' ? hours24 : hours12;

    const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondStr = seconds < 10 ? `0${seconds}` : seconds;

    let result = `${hourStr}:${minuteStr}`;

    if (secondPart) {
      result += `:${secondStr}`;
    }

    if (ampmPart) {
      result += ` ${ampm}`;
    }

    return result;
  }

  /**
   * Initialise les paramètres régionaux par défaut
   */
  private initializeDefaultLocales(): void {
    const defaultLocales: LocaleSettings[] = [
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          precision: 2,
          currency: 'EUR',
          currencyPosition: 'after'
        },
        weekStart: 1,
        timezone: 'Europe/Paris'
      },
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        direction: 'ltr',
        dateFormat: DateFormat.MM_DD_YYYY,
        timeFormat: TimeFormat.HH_MM_A,
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2,
          currency: 'USD',
          currencyPosition: 'before'
        },
        weekStart: 0,
        timezone: 'UTC'
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2,
          currency: 'EUR',
          currencyPosition: 'after'
        },
        weekStart: 1,
        timezone: 'Europe/Madrid'
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2,
          currency: 'EUR',
          currencyPosition: 'after'
        },
        weekStart: 1,
        timezone: 'Europe/Berlin'
      },
      {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2,
          currency: 'EUR',
          currencyPosition: 'after'
        },
        weekStart: 1,
        timezone: 'Europe/Rome'
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇵🇹',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2,
          currency: 'EUR',
          currencyPosition: 'after'
        },
        weekStart: 0,
        timezone: 'Europe/Lisbon'
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        flag: '🇷🇺',
        direction: 'ltr',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          precision: 2,
          currency: 'RUB',
          currencyPosition: 'after'
        },
        weekStart: 1,
        timezone: 'Europe/Moscow'
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        direction: 'rtl',
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2,
          currency: 'SAR',
          currencyPosition: 'before'
        },
        weekStart: 0,
        timezone: 'Asia/Riyadh'
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        direction: 'ltr',
        dateFormat: DateFormat.YYYY_MM_DD,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2,
          currency: 'CNY',
          currencyPosition: 'before'
        },
        weekStart: 1,
        timezone: 'Asia/Shanghai'
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        direction: 'ltr',
        dateFormat: DateFormat.YYYY_MM_DD,
        timeFormat: TimeFormat.HH_MM,
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2,
          currency: 'JPY',
          currencyPosition: 'before'
        },
        weekStart: 0,
        timezone: 'Asia/Tokyo'
      }
    ];

    for (const locale of defaultLocales) {
      this.addLocale(locale);
    }

    // Ajouter des traductions par défaut
    this.addDefaultTranslations();
  }

  /**
   * Ajoute des traductions par défaut
   */
  private addDefaultTranslations(): void {
    const defaultTranslations: Translation[] = [
      // Français
      { key: 'view.title', value: 'Vue', locale: 'fr' },
      { key: 'view.add', value: 'Ajouter', locale: 'fr' },
      { key: 'view.edit', value: 'Modifier', locale: 'fr' },
      { key: 'view.delete', value: 'Supprimer', locale: 'fr' },
      { key: 'view.save', value: 'Enregistrer', locale: 'fr' },
      { key: 'view.cancel', value: 'Annuler', locale: 'fr' },
      { key: 'view.search', value: 'Rechercher', locale: 'fr' },
      { key: 'view.filter', value: 'Filtrer', locale: 'fr' },
      { key: 'view.sort', value: 'Trier', locale: 'fr' },
      { key: 'view.group', value: 'Grouper', locale: 'fr' },
      { key: 'view.export', value: 'Exporter', locale: 'fr' },
      { key: 'view.import', value: 'Importer', locale: 'fr' },
      { key: 'view.loading', value: 'Chargement...', locale: 'fr' },
      { key: 'view.no_data', value: 'Aucune donnée disponible', locale: 'fr' },
      { key: 'view.error', value: 'Erreur', locale: 'fr' },
      { key: 'view.success', value: 'Succès', locale: 'fr' },
      { key: 'view.confirm_delete', value: 'Êtes-vous sûr de vouloir supprimer cet élément ?', locale: 'fr' },
      { key: 'view.confirm_save', value: 'Êtes-vous sûr de vouloir enregistrer les modifications ?', locale: 'fr' },
      { key: 'view.items_count', value: '{{count}} élément(s)', locale: 'fr' },
      { key: 'view.items_count_plural', value: '{{count}} éléments', locale: 'fr' },

      // Anglais
      { key: 'view.title', value: 'View', locale: 'en' },
      { key: 'view.add', value: 'Add', locale: 'en' },
      { key: 'view.edit', value: 'Edit', locale: 'en' },
      { key: 'view.delete', value: 'Delete', locale: 'en' },
      { key: 'view.save', value: 'Save', locale: 'en' },
      { key: 'view.cancel', value: 'Cancel', locale: 'en' },
      { key: 'view.search', value: 'Search', locale: 'en' },
      { key: 'view.filter', value: 'Filter', locale: 'en' },
      { key: 'view.sort', value: 'Sort', locale: 'en' },
      { key: 'view.group', value: 'Group', locale: 'en' },
      { key: 'view.export', value: 'Export', locale: 'en' },
      { key: 'view.import', value: 'Import', locale: 'en' },
      { key: 'view.loading', value: 'Loading...', locale: 'en' },
      { key: 'view.no_data', value: 'No data available', locale: 'en' },
      { key: 'view.error', value: 'Error', locale: 'en' },
      { key: 'view.success', value: 'Success', locale: 'en' },
      { key: 'view.confirm_delete', value: 'Are you sure you want to delete this item?', locale: 'en' },
      { key: 'view.confirm_save', value: 'Are you sure you want to save changes?', locale: 'en' },
      { key: 'view.items_count', value: '{{count}} item(s)', locale: 'en' },
      { key: 'view.items_count_plural', value: '{{count}} items', locale: 'en' },

      // Espagnol
      { key: 'view.title', value: 'Vista', locale: 'es' },
      { key: 'view.add', value: 'Agregar', locale: 'es' },
      { key: 'view.edit', value: 'Editar', locale: 'es' },
      { key: 'view.delete', value: 'Eliminar', locale: 'es' },
      { key: 'view.save', value: 'Guardar', locale: 'es' },
      { key: 'view.cancel', value: 'Cancelar', locale: 'es' },
      { key: 'view.search', value: 'Buscar', locale: 'es' },
      { key: 'view.filter', value: 'Filtrar', locale: 'es' },
      { key: 'view.sort', value: 'Ordenar', locale: 'es' },
      { key: 'view.group', value: 'Agrupar', locale: 'es' },
      { key: 'view.export', value: 'Exportar', locale: 'es' },
      { key: 'view.import', value: 'Importar', locale: 'es' },
      { key: 'view.loading', value: 'Cargando...', locale: 'es' },
      { key: 'view.no_data', value: 'No hay datos disponibles', locale: 'es' },
      { key: 'view.error', value: 'Error', locale: 'es' },
      { key: 'view.success', value: 'Éxito', locale: 'es' },
      { key: 'view.confirm_delete', value: '¿Está seguro de que desea eliminar este elemento?', locale: 'es' },
      { key: 'view.confirm_save', value: '¿Está seguro de que desea guardar los cambios?', locale: 'es' },
      { key: 'view.items_count', value: '{{count}} elemento(s)', locale: 'es' },
      { key: 'view.items_count_plural', value: '{{count}} elementos', locale: 'es' }
    ];

    this.addTranslations(defaultTranslations);
  }

  /**
   * Détecte la langue du navigateur
   */
  private detectBrowserLanguage(): void {
    if (typeof window === 'undefined' || !navigator) {
      return;
    }

    const browserLang = navigator.language || (navigator as any).userLanguage;
    const shortLang = browserLang.split('-')[0];

    // Vérifier si la langue du navigateur est disponible
    if (this.locales.has(browserLang)) {
      this.setLocale(browserLang);
    } else if (this.locales.has(shortLang)) {
      this.setLocale(shortLang);
    } else {
      // Utiliser la langue par défaut
      this.setLocale(this.options.defaultLocale);
    }
  }

  /**
   * Charge depuis le localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const savedLocale = localStorage.getItem('entidr_locale');
      if (savedLocale && this.locales.has(savedLocale)) {
        this.setLocale(savedLocale);
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn('[ViewI18nService] Failed to load locale from localStorage:', error);
      }
    }
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Nettoyer périodiquement le cache expiré
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Toutes les minutes
  }

  /**
   * Nettoie le cache expiré
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.options.cacheTTL) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.options.debug && keysToDelete.length > 0) {
      console.log(`[ViewI18nService] Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

// Exporter une instance singleton pour une utilisation facile
export const viewI18nService = new EntidrViewI18nService({
  defaultLocale: 'fr',
  fallbackLocale: 'en',
  enableBrowserDetection: true,
  enableLocalStorage: true,
  enableCache: true,
  cacheTTL: 300000,
  debug: false
});

export default EntidrViewI18nService;
