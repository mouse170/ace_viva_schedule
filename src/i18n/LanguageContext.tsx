import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AceVivaMember, MemberCategory } from '../data/members';

export type AppLang = 'zh-TW' | 'ko';

const LANG_STORAGE_KEY = 'ace_viva_lang_v1';

export const MEMBER_KO_NAMES: Record<string, string> = {
  yuri: '유리 (Yuri)',
  mamai: '마메이',
  avawu: '우이쉬안',
  shenxuan: '신쉬안',
  chayounghyun: '차영현',
  leejuhee: '이주희',
  jungheejung: '정희정',
  yipei: '이페이',
  ann: '앤 (Ann)',
  ella: '엘라 (Ella)',
  yixuan: '이쉬안',
  nicole: '니콜 (Nicole)',
  sinping: '신핑',
  xuanxuan: '쉬안쉬안',
  peichen: '페이천',
  weiwei: '웨이웨이',
  mega: '메가 (Mega)',
  yuan: '위안',
};

export const CATEGORY_KO_LABELS: Record<MemberCategory, string> = {
  leader: '팀장',
  mc: '홈 MC',
  tw_member: '대만 멤버',
  kr_member: '한국 멤버',
};

export const EXPERIENCE_KO_SHORT: Record<string, string> = {
  dragon_beauties: '웨이취안',
  yankees_girls: '양키스걸즈',
  pilots_crew: '파일럿츠',
  taishin_wonders: '타이신',
  woohoo_power: 'WooHoo',
  pink_fun: 'PINK FUN',
  rakuten_girls: '라쿠텐',
  uni_girls: '유니걸즈',
  kr_league: 'KBO 출신',
};

interface LanguageContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  toggleLang: () => void;
  t: (zhText: string, koText: string) => string;
  getMemberName: (member: Pick<AceVivaMember, 'id' | 'name'>) => string;
  getCategoryLabel: (cat: MemberCategory, zhFallback: string) => string;
  getExperienceShort: (expId: string, zhFallback: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): AppLang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ko' || saved === 'zh-TW') {
      return saved;
    }
    if (
      typeof navigator !== 'undefined' &&
      navigator.language.toLowerCase().startsWith('ko')
    ) {
      return 'ko';
    }
  } catch {
    // Ignore storage/navigator access errors
  }
  return 'zh-TW';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLang>(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'ko' ? 'ko' : 'zh-Hant-TW';
    }
  }, [lang]);

  const setLang = (next: AppLang) => setLangState(next);
  const toggleLang = () =>
    setLangState((prev) => (prev === 'zh-TW' ? 'ko' : 'zh-TW'));
  const t = (zhText: string, koText: string) =>
    lang === 'ko' ? koText : zhText;
  const getMemberName = (member: Pick<AceVivaMember, 'id' | 'name'>) =>
    lang === 'ko' ? MEMBER_KO_NAMES[member.id] ?? member.name : member.name;
  const getCategoryLabel = (cat: MemberCategory, zhFallback: string) =>
    lang === 'ko' ? CATEGORY_KO_LABELS[cat] : zhFallback;
  const getExperienceShort = (expId: string, zhFallback: string) =>
    lang === 'ko' ? EXPERIENCE_KO_SHORT[expId] ?? zhFallback : zhFallback;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        getMemberName,
        getCategoryLabel,
        getExperienceShort,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
