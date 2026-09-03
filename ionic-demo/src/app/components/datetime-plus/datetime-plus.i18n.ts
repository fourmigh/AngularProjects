import {
  LOCALES, Option,
  PRESENTATIONS, HOUR_CYCLES, SIZES, WEEK_DAYS,
  HOUR_VALUE_PRESETS, MINUTE_VALUE_PRESETS,
} from './datetime-plus.constants';
import type {
  Presentation, HourCycle, DatetimeSize,
} from './datetime-plus.constants';

export type DurationUnit = 'day' | 'hour' | 'minute' | 'second';

type PluralLabels = Record<string, string>;

type LocaleLanguage = (typeof LOCALES)[number]['value'];

export type DurationLanguage = LocaleLanguage;

const DURATION_LABELS: Record<DurationLanguage, Record<DurationUnit, PluralLabels>> = {
  en: {
    day: { one: 'day', other: 'days' },
    hour: { one: 'hour', other: 'hours' },
    minute: { one: 'minute', other: 'minutes' },
    second: { one: 'second', other: 'seconds' },
  },
  zh: {
    day: { other: '天' },
    hour: { other: '小时' },
    minute: { other: '分' },
    second: { other: '秒' },
  },
  ja: {
    day: { other: '日' },
    hour: { other: '時間' },
    minute: { other: '分' },
    second: { other: '秒' },
  },
  es: {
    day: { one: 'día', other: 'días' },
    hour: { one: 'hora', other: 'horas' },
    minute: { one: 'minuto', other: 'minutos' },
    second: { one: 'segundo', other: 'segundos' },
  },
  fr: {
    day: { one: 'jour', other: 'jours' },
    hour: { one: 'heure', other: 'heures' },
    minute: { one: 'minute', other: 'minutes' },
    second: { one: 'seconde', other: 'secondes' },
  },
  de: {
    day: { one: 'Tag', other: 'Tage' },
    hour: { one: 'Stunde', other: 'Stunden' },
    minute: { one: 'Minute', other: 'Minuten' },
    second: { one: 'Sekunde', other: 'Sekunden' },
  },
  ko: {
    day: { other: '일' },
    hour: { other: '시간' },
    minute: { other: '분' },
    second: { other: '초' },
  },
  ar: {
    day: { one: 'يوم', two: 'يومان', few: 'أيام', many: 'يوم' },
    hour: { one: 'ساعة', two: 'ساعتان', few: 'ساعات', many: 'ساعة' },
    minute: { one: 'دقيقة', two: 'دقيقتان', few: 'دقائق', many: 'دقيقة' },
    second: { one: 'ثانية', two: 'ثانيتان', few: 'ثوانٍ', many: 'ثانية' },
  },
};

type UiCategory = 'presentation' | 'hourCycle' | 'size' | 'hourValuePreset' | 'minuteValuePreset' | 'noSelection' | 'pickerModal';

const UI_LABELS: Record<DurationLanguage, Record<string, string>> = {
  en: {
    'presentation:time': 'Time',
    'presentation:date': 'Date',
    'presentation:date-time': 'Date-Time',
    'presentation:time-date': 'Time-Date',
    'presentation:week': 'Week',
    'presentation:month': 'Month',
    'presentation:month-year': 'Month-Year',
    'presentation:year': 'Year',
    'hourCycle:h12': '12 Hour',
    'hourCycle:h24': '24 Hour',
    'size:cover': 'Cover',
    'size:fixed': 'Fixed',
    'hourValuePreset:': 'All Hours',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': 'Business Hours (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': 'Morning (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': 'Afternoon (12-18)',
    'hourValuePreset:18,19,20,21,22,23': 'Evening (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': 'Night (0-6)',
    'minuteValuePreset:': 'All Minutes',
    'minuteValuePreset:0,15,30,45': 'Every 15 min',
    'minuteValuePreset:0,10,20,30,40,50': 'Every 10 min',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': 'Every 5 min',
    'minuteValuePreset:0,30': 'Every 30 min',
    'noSelection:': 'No selection',
    'pickerModal:cancel': 'Cancel',
    'pickerModal:clear': 'Clear',
    'pickerModal:ok': 'OK',
    'pickerModal:setMin': 'Set Min',
    'pickerModal:setMax': 'Set Max',
  },
  zh: {
    'presentation:time': '时间',
    'presentation:date': '日期',
    'presentation:date-time': '日期时间',
    'presentation:time-date': '时间日期',
    'presentation:week': '周',
    'presentation:month': '月',
    'presentation:month-year': '年月',
    'presentation:year': '年',
    'hourCycle:h12': '12 小时制',
    'hourCycle:h24': '24 小时制',
    'size:cover': '铺满',
    'size:fixed': '固定',
    'hourValuePreset:': '全部时间',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': '工作时间（9-17）',
    'hourValuePreset:6,7,8,9,10,11,12': '上午（6-12）',
    'hourValuePreset:12,13,14,15,16,17,18': '下午（12-18）',
    'hourValuePreset:18,19,20,21,22,23': '晚上（18-24）',
    'hourValuePreset:0,1,2,3,4,5,6': '夜间（0-6）',
    'minuteValuePreset:': '全部分钟',
    'minuteValuePreset:0,15,30,45': '每 15 分钟',
    'minuteValuePreset:0,10,20,30,40,50': '每 10 分钟',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': '每 5 分钟',
    'minuteValuePreset:0,30': '每 30 分钟',
    'noSelection:': '未选择',
    'pickerModal:cancel': '取消',
    'pickerModal:clear': '清除',
    'pickerModal:ok': '确定',
    'pickerModal:setMin': '设置最小值',
    'pickerModal:setMax': '设置最大值',
  },
  ja: {
    'presentation:time': '時刻',
    'presentation:date': '日付',
    'presentation:date-time': '日時',
    'presentation:time-date': '時刻日付',
    'presentation:week': '週',
    'presentation:month': '月',
    'presentation:month-year': '年月',
    'presentation:year': '年',
    'hourCycle:h12': '12時間',
    'hourCycle:h24': '24時間',
    'size:cover': 'カバー',
    'size:fixed': '固定',
    'hourValuePreset:': 'すべての時間',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': '営業時間（9-17）',
    'hourValuePreset:6,7,8,9,10,11,12': '午前（6-12）',
    'hourValuePreset:12,13,14,15,16,17,18': '午後（12-18）',
    'hourValuePreset:18,19,20,21,22,23': '夕方（18-24）',
    'hourValuePreset:0,1,2,3,4,5,6': '夜間（0-6）',
    'minuteValuePreset:': 'すべての分',
    'minuteValuePreset:0,15,30,45': '15分ごと',
    'minuteValuePreset:0,10,20,30,40,50': '10分ごと',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': '5分ごと',
    'minuteValuePreset:0,30': '30分ごと',
    'noSelection:': '未選択',
    'pickerModal:cancel': 'キャンセル',
    'pickerModal:clear': 'クリア',
    'pickerModal:ok': 'OK',
    'pickerModal:setMin': '最小を設定',
    'pickerModal:setMax': '最大を設定',
  },
  es: {
    'presentation:time': 'Hora',
    'presentation:date': 'Fecha',
    'presentation:date-time': 'Fecha y hora',
    'presentation:time-date': 'Hora y fecha',
    'presentation:week': 'Semana',
    'presentation:month': 'Mes',
    'presentation:month-year': 'Mes y año',
    'presentation:year': 'Año',
    'hourCycle:h12': '12 horas',
    'hourCycle:h24': '24 horas',
    'size:cover': 'Cubrir',
    'size:fixed': 'Fijo',
    'hourValuePreset:': 'Todas las horas',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': 'Horas laborales (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': 'Mañana (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': 'Tarde (12-18)',
    'hourValuePreset:18,19,20,21,22,23': 'Noche (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': 'Madrugada (0-6)',
    'minuteValuePreset:': 'Todos los minutos',
    'minuteValuePreset:0,15,30,45': 'Cada 15 min',
    'minuteValuePreset:0,10,20,30,40,50': 'Cada 10 min',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': 'Cada 5 min',
    'minuteValuePreset:0,30': 'Cada 30 min',
    'noSelection:': 'Sin selección',
    'pickerModal:cancel': 'Cancelar',
    'pickerModal:clear': 'Limpiar',
    'pickerModal:ok': 'Aceptar',
    'pickerModal:setMin': 'Establecer mínimo',
    'pickerModal:setMax': 'Establecer máximo',
  },
  fr: {
    'presentation:time': 'Heure',
    'presentation:date': 'Date',
    'presentation:date-time': 'Date-heure',
    'presentation:time-date': 'Heure-date',
    'presentation:week': 'Semaine',
    'presentation:month': 'Mois',
    'presentation:month-year': 'Mois-année',
    'presentation:year': 'Année',
    'hourCycle:h12': '12 heures',
    'hourCycle:h24': '24 heures',
    'size:cover': 'Couvrir',
    'size:fixed': 'Fixe',
    'hourValuePreset:': 'Toutes les heures',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': 'Heures de travail (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': 'Matin (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': 'Après-midi (12-18)',
    'hourValuePreset:18,19,20,21,22,23': 'Soir (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': 'Nuit (0-6)',
    'minuteValuePreset:': 'Toutes les minutes',
    'minuteValuePreset:0,15,30,45': 'Toutes les 15 min',
    'minuteValuePreset:0,10,20,30,40,50': 'Toutes les 10 min',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': 'Toutes les 5 min',
    'minuteValuePreset:0,30': 'Toutes les 30 min',
    'noSelection:': 'Aucune sélection',
    'pickerModal:cancel': 'Annuler',
    'pickerModal:clear': 'Effacer',
    'pickerModal:ok': 'OK',
    'pickerModal:setMin': 'Définir le minimum',
    'pickerModal:setMax': 'Définir le maximum',
  },
  de: {
    'presentation:time': 'Uhrzeit',
    'presentation:date': 'Datum',
    'presentation:date-time': 'Datum und Uhrzeit',
    'presentation:time-date': 'Uhrzeit und Datum',
    'presentation:week': 'Woche',
    'presentation:month': 'Monat',
    'presentation:month-year': 'Monat und Jahr',
    'presentation:year': 'Jahr',
    'hourCycle:h12': '12 Stunden',
    'hourCycle:h24': '24 Stunden',
    'size:cover': 'Abdecken',
    'size:fixed': 'Fest',
    'hourValuePreset:': 'Alle Stunden',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': 'Geschäftszeiten (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': 'Vormittag (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': 'Nachmittag (12-18)',
    'hourValuePreset:18,19,20,21,22,23': 'Abend (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': 'Nacht (0-6)',
    'minuteValuePreset:': 'Alle Minuten',
    'minuteValuePreset:0,15,30,45': 'Alle 15 min',
    'minuteValuePreset:0,10,20,30,40,50': 'Alle 10 min',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': 'Alle 5 min',
    'minuteValuePreset:0,30': 'Alle 30 min',
    'noSelection:': 'Keine Auswahl',
    'pickerModal:cancel': 'Abbrechen',
    'pickerModal:clear': 'Löschen',
    'pickerModal:ok': 'OK',
    'pickerModal:setMin': 'Minimum festlegen',
    'pickerModal:setMax': 'Maximum festlegen',
  },
  ko: {
    'presentation:time': '시간',
    'presentation:date': '날짜',
    'presentation:date-time': '날짜 시간',
    'presentation:time-date': '시간 날짜',
    'presentation:week': '주',
    'presentation:month': '월',
    'presentation:month-year': '년월',
    'presentation:year': '년',
    'hourCycle:h12': '12시간',
    'hourCycle:h24': '24시간',
    'size:cover': '덮개',
    'size:fixed': '고정',
    'hourValuePreset:': '모든 시간',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': '업무 시간 (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': '오전 (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': '오후 (12-18)',
    'hourValuePreset:18,19,20,21,22,23': '저녁 (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': '새벽 (0-6)',
    'minuteValuePreset:': '모든 분',
    'minuteValuePreset:0,15,30,45': '매 15분',
    'minuteValuePreset:0,10,20,30,40,50': '매 10분',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': '매 5분',
    'minuteValuePreset:0,30': '매 30분',
    'noSelection:': '선택 없음',
    'pickerModal:cancel': '취소',
    'pickerModal:clear': '지우기',
    'pickerModal:ok': '확인',
    'pickerModal:setMin': '최소 설정',
    'pickerModal:setMax': '최대 설정',
  },
  ar: {
    'presentation:time': 'الوقت',
    'presentation:date': 'التاريخ',
    'presentation:date-time': 'التاريخ والوقت',
    'presentation:time-date': 'الوقت والتاريخ',
    'presentation:week': 'أسبوع',
    'presentation:month': 'شهر',
    'presentation:month-year': 'شهر وسنة',
    'presentation:year': 'سنة',
    'hourCycle:h12': '12 ساعة',
    'hourCycle:h24': '24 ساعة',
    'size:cover': 'تغطية',
    'size:fixed': 'ثابت',
    'hourValuePreset:': 'كل الساعات',
    'hourValuePreset:9,10,11,12,13,14,15,16,17': 'ساعات العمل (9-17)',
    'hourValuePreset:6,7,8,9,10,11,12': 'الصباح (6-12)',
    'hourValuePreset:12,13,14,15,16,17,18': 'بعد الظهر (12-18)',
    'hourValuePreset:18,19,20,21,22,23': 'المساء (18-24)',
    'hourValuePreset:0,1,2,3,4,5,6': 'الليل (0-6)',
    'minuteValuePreset:': 'كل الدقائق',
    'minuteValuePreset:0,15,30,45': 'كل 15 دقيقة',
    'minuteValuePreset:0,10,20,30,40,50': 'كل 10 دقائق',
    'minuteValuePreset:0,5,10,15,20,25,30,35,40,45,50,55': 'كل 5 دقائق',
    'minuteValuePreset:0,30': 'كل 30 دقيقة',
    'noSelection:': 'لا تحديد',
    'pickerModal:cancel': 'إلغاء',
    'pickerModal:clear': 'مسح',
    'pickerModal:ok': 'موافق',
    'pickerModal:setMin': 'الحد الأدنى',
    'pickerModal:setMax': 'الحد الأقصى',
  },
};

export function formatDuration(locale: string, value: number, unit: DurationUnit): string {
  const language = (locale || 'en').split('-')[0].toLowerCase();
  const labels = DURATION_LABELS[language as DurationLanguage] ?? DURATION_LABELS['en'];
  const category = new Intl.PluralRules(language).select(value);
  const label = labels[unit][category] ?? labels[unit]['other'] ?? labels[unit]['one'];
  const num = new Intl.NumberFormat(locale).format(value);
  return `${num} ${label}`;
}

function translate(
  locale: string,
  category: UiCategory,
  value: string | number,
  fallback: string,
): string {
  const language = (locale || 'en').split('-')[0].toLowerCase();
  const langLabels = UI_LABELS[language as DurationLanguage] ?? UI_LABELS['en'];
  const key = `${category}:${value}`;
  return langLabels[key] ?? fallback;
}

export function localizePresentations(locale: string): Option<Presentation>[] {
  return PRESENTATIONS.map(o => ({ ...o, label: translate(locale, 'presentation', o.value, o.label) }));
}

export function localizeHourCycles(locale: string): Option<HourCycle>[] {
  return HOUR_CYCLES.map(o => ({ ...o, label: translate(locale, 'hourCycle', o.value, o.label) }));
}

export function localizeSizes(locale: string): Option<DatetimeSize>[] {
  return SIZES.map(o => ({ ...o, label: translate(locale, 'size', o.value, o.label) }));
}

export function localizeWeekDays(locale: string): Option<number>[] {
  return WEEK_DAYS.map(o => ({ ...o, label: formatWeekday(locale, o.value) }));
}

export function localizeHourValuePresets(locale: string): Option<string>[] {
  return HOUR_VALUE_PRESETS.map(o => ({ ...o, label: translate(locale, 'hourValuePreset', o.value, o.label) }));
}

export function localizeMinuteValuePresets(locale: string): Option<string>[] {
  return MINUTE_VALUE_PRESETS.map(o => ({ ...o, label: translate(locale, 'minuteValuePreset', o.value, o.label) }));
}

export function localizeNoSelection(locale: string): string {
  return translate(locale, 'noSelection', '', 'No selection');
}

export function localizePickerModal(locale: string, key: string): string {
  return translate(locale, 'pickerModal', key, key);
}

function formatWeekday(locale: string, day: number): string {
  const date = new Date(2023, 0, 1 + day);
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
}