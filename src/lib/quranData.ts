// Metadata for the complete Quran: all 114 surahs and all 30 juz (paras).
// Drives the Quran section of the curriculum — tiles, search, and the
// full-surah / full-parah reading view (text itself is fetched at runtime
// from api.alquran.cloud, audio from cdn.islamic.network).

export interface SurahMeta {
  n: number
  name: string
  arabic: string
  ayahs: number
  revelation: 'Meccan' | 'Medinan'
}

// [name, arabic, ayahCount, revelation (1 = Meccan, 0 = Medinan)]
const RAW_SURAHS: [string, string, number, 0 | 1][] = [
  ['Al-Fatiha', 'الفاتحة', 7, 1],
  ['Al-Baqarah', 'البقرة', 286, 0],
  ["Aal-E-Imran", 'آل عمران', 200, 0],
  ['An-Nisa', 'النساء', 176, 0],
  ["Al-Ma'idah", 'المائدة', 120, 0],
  ["Al-An'am", 'الأنعام', 165, 1],
  ["Al-A'raf", 'الأعراف', 206, 1],
  ['Al-Anfal', 'الأنفال', 75, 0],
  ['At-Tawbah', 'التوبة', 129, 0],
  ['Yunus', 'يونس', 109, 1],
  ['Hud', 'هود', 123, 1],
  ['Yusuf', 'يوسف', 111, 1],
  ["Ar-Ra'd", 'الرعد', 43, 0],
  ['Ibrahim', 'إبراهيم', 52, 1],
  ['Al-Hijr', 'الحجر', 99, 1],
  ['An-Nahl', 'النحل', 128, 1],
  ['Al-Isra', 'الإسراء', 111, 1],
  ['Al-Kahf', 'الكهف', 110, 1],
  ['Maryam', 'مريم', 98, 1],
  ['Taha', 'طه', 135, 1],
  ['Al-Anbiya', 'الأنبياء', 112, 1],
  ['Al-Hajj', 'الحج', 78, 0],
  ["Al-Mu'minun", 'المؤمنون', 118, 1],
  ['An-Nur', 'النور', 64, 0],
  ['Al-Furqan', 'الفرقان', 77, 1],
  ["Ash-Shu'ara", 'الشعراء', 227, 1],
  ['An-Naml', 'النمل', 93, 1],
  ['Al-Qasas', 'القصص', 88, 1],
  ['Al-Ankabut', 'العنكبوت', 69, 1],
  ['Ar-Rum', 'الروم', 60, 1],
  ['Luqman', 'لقمان', 34, 1],
  ['As-Sajdah', 'السجدة', 30, 1],
  ['Al-Ahzab', 'الأحزاب', 73, 0],
  ['Saba', 'سبأ', 54, 1],
  ['Fatir', 'فاطر', 45, 1],
  ['Ya-Sin', 'يس', 83, 1],
  ['As-Saffat', 'الصافات', 182, 1],
  ['Sad', 'ص', 88, 1],
  ['Az-Zumar', 'الزمر', 75, 1],
  ['Ghafir', 'غافر', 85, 1],
  ['Fussilat', 'فصلت', 54, 1],
  ['Ash-Shura', 'الشورى', 53, 1],
  ['Az-Zukhruf', 'الزخرف', 89, 1],
  ['Ad-Dukhan', 'الدخان', 59, 1],
  ['Al-Jathiyah', 'الجاثية', 37, 1],
  ['Al-Ahqaf', 'الأحقاف', 35, 1],
  ['Muhammad', 'محمد', 38, 0],
  ['Al-Fath', 'الفتح', 29, 0],
  ['Al-Hujurat', 'الحجرات', 18, 0],
  ['Qaf', 'ق', 45, 1],
  ['Adh-Dhariyat', 'الذاريات', 60, 1],
  ['At-Tur', 'الطور', 49, 1],
  ['An-Najm', 'النجم', 62, 1],
  ['Al-Qamar', 'القمر', 55, 1],
  ['Ar-Rahman', 'الرحمن', 78, 0],
  ["Al-Waqi'ah", 'الواقعة', 96, 1],
  ['Al-Hadid', 'الحديد', 29, 0],
  ['Al-Mujadila', 'المجادلة', 22, 0],
  ['Al-Hashr', 'الحشر', 24, 0],
  ['Al-Mumtahanah', 'الممتحنة', 13, 0],
  ['As-Saff', 'الصف', 14, 0],
  ["Al-Jumu'ah", 'الجمعة', 11, 0],
  ['Al-Munafiqun', 'المنافقون', 11, 0],
  ['At-Taghabun', 'التغابن', 18, 0],
  ['At-Talaq', 'الطلاق', 12, 0],
  ['At-Tahrim', 'التحريم', 12, 0],
  ['Al-Mulk', 'الملك', 30, 1],
  ['Al-Qalam', 'القلم', 52, 1],
  ['Al-Haqqah', 'الحاقة', 52, 1],
  ["Al-Ma'arij", 'المعارج', 44, 1],
  ['Nuh', 'نوح', 28, 1],
  ['Al-Jinn', 'الجن', 28, 1],
  ['Al-Muzzammil', 'المزمل', 20, 1],
  ['Al-Muddaththir', 'المدثر', 56, 1],
  ['Al-Qiyamah', 'القيامة', 40, 1],
  ['Al-Insan', 'الإنسان', 31, 0],
  ['Al-Mursalat', 'المرسلات', 50, 1],
  ['An-Naba', 'النبأ', 40, 1],
  ["An-Nazi'at", 'النازعات', 46, 1],
  ['Abasa', 'عبس', 42, 1],
  ['At-Takwir', 'التكوير', 29, 1],
  ['Al-Infitar', 'الانفطار', 19, 1],
  ['Al-Mutaffifin', 'المطففين', 36, 1],
  ['Al-Inshiqaq', 'الانشقاق', 25, 1],
  ['Al-Buruj', 'البروج', 22, 1],
  ['At-Tariq', 'الطارق', 17, 1],
  ["Al-A'la", 'الأعلى', 19, 1],
  ['Al-Ghashiyah', 'الغاشية', 26, 1],
  ['Al-Fajr', 'الفجر', 30, 1],
  ['Al-Balad', 'البلد', 20, 1],
  ['Ash-Shams', 'الشمس', 15, 1],
  ['Al-Layl', 'الليل', 21, 1],
  ['Ad-Duha', 'الضحى', 11, 1],
  ['Ash-Sharh', 'الشرح', 8, 1],
  ['At-Tin', 'التين', 8, 1],
  ['Al-Alaq', 'العلق', 19, 1],
  ['Al-Qadr', 'القدر', 5, 1],
  ['Al-Bayyinah', 'البينة', 8, 0],
  ['Az-Zalzalah', 'الزلزلة', 8, 0],
  ['Al-Adiyat', 'العاديات', 11, 1],
  ["Al-Qari'ah", 'القارعة', 11, 1],
  ['At-Takathur', 'التكاثر', 8, 1],
  ['Al-Asr', 'العصر', 3, 1],
  ['Al-Humazah', 'الهمزة', 9, 1],
  ['Al-Fil', 'الفيل', 5, 1],
  ['Quraysh', 'قريش', 4, 1],
  ["Al-Ma'un", 'الماعون', 7, 1],
  ['Al-Kawthar', 'الكوثر', 3, 1],
  ['Al-Kafirun', 'الكافرون', 6, 1],
  ['An-Nasr', 'النصر', 3, 0],
  ['Al-Masad', 'المسد', 5, 1],
  ['Al-Ikhlas', 'الإخلاص', 4, 1],
  ['Al-Falaq', 'الفلق', 5, 1],
  ['An-Nas', 'الناس', 6, 1],
]

export const SURAHS: SurahMeta[] = RAW_SURAHS.map(([name, arabic, ayahs, rev], i) => ({
  n: i + 1,
  name,
  arabic,
  ayahs,
  revelation: rev === 1 ? 'Meccan' : 'Medinan',
}))

export function getSurah(n: number): SurahMeta | undefined {
  return SURAHS[n - 1]
}

// Resolves which surah a global ayah number (1–6236) belongs to
export function surahOfGlobalAyah(global: number): SurahMeta {
  let acc = 0
  for (const s of SURAHS) {
    acc += s.ayahs
    if (global <= acc) return s
  }
  return SURAHS[SURAHS.length - 1]
}

export interface JuzMeta {
  n: number
  /** Traditional name, taken from the first distinctive word of the para */
  name: string
  startSurah: number
  startAyah: number
  pageFrom: number
  pageTo: number
}

// Standard Madani mushaf: each para spans 20 pages (604 pages total)
const RAW_JUZ: [string, number, number][] = [
  ['Alif-Lam-Mim', 1, 1],
  ['Sayaqul', 2, 142],
  ['Tilka ar-Rusul', 2, 253],
  ['Lan Tanalu', 3, 93],
  ['Wal-Muhsanat', 4, 24],
  ['La Yuhibbullah', 4, 148],
  ['Wa Idha Samiu', 5, 82],
  ['Wa Law Annana', 6, 111],
  ['Qala al-Mala', 7, 88],
  ['Wa Alamu', 8, 41],
  ['Yatazirun', 9, 93],
  ['Wa Ma Min Dabbah', 11, 6],
  ['Wa Ma Ubriyu', 12, 53],
  ['Rubama', 15, 1],
  ['Subhana alladhi', 17, 1],
  ['Qala Alam', 18, 75],
  ['Iqtaraba', 21, 1],
  ['Qad Aflaha', 23, 1],
  ['Wa Qala alladhina', 25, 21],
  ['Amman Khalaqa', 27, 56],
  ['Utlu Ma Uhiya', 29, 46],
  ['Wa Man Yaqnut', 33, 31],
  ['Wa Maliya', 36, 28],
  ['Faman Azlam', 39, 32],
  ['Ilayhi Yuraddu', 41, 47],
  ['Ha Mim', 46, 1],
  ['Qala Fama Khatbukum', 51, 31],
  ['Qad Sami Allah', 58, 1],
  ['Tabarak alladhi', 67, 1],
  ['Amma', 78, 1],
]

export const JUZ_LIST: JuzMeta[] = RAW_JUZ.map(([name, startSurah, startAyah], i) => ({
  n: i + 1,
  name,
  startSurah,
  startAyah,
  pageFrom: i * 20 + 1,
  pageTo: i === 29 ? 604 : (i + 1) * 20,
}))

export function getJuz(n: number): JuzMeta | undefined {
  return JUZ_LIST[n - 1]
}
