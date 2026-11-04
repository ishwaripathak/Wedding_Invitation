import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {weddingData} from './data/weddingData';
import {readStored, writeStored} from './storage';
import {languageIndex, messages} from './translations';
import type {Language, MessageKey} from './translations';

type Translator = (key: MessageKey) => string;
type LanguageContextValue = {language: Language; setLanguage: (language: Language) => void; t: Translator};
const LanguageContext = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguage] = useState<Language>(() => readStored('sagar-ishwari-language', 'en', (v): v is Language => v === 'en' || v === 'gu' || v === 'hi'));
  const value = useMemo(() => ({language, setLanguage, t: (key: MessageKey) => messages[key][languageIndex[language]]}), [language]);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = value.t('groomFull') + ' & ' + value.t('brideFull') + ' | 16 ' + value.t('month') + ' 2027';
    writeStored('sagar-ishwari-language', language);
  }, [language, value]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('Invitation translations require LanguageProvider.');
  return context;
}
export function useWeddingData() {
  const {t} = useLanguage();
  const eventKeys = ['engagement', 'ganesh', 'haldi', 'sangeet', 'wedding'] as const;
  const timeKeys = ['engagementTime', 'ganeshTime', 'haldiTime', 'sangeetTime', 'weddingTime'] as const;
  const dressKeys = ['traditionalDress', 'traditionalDress', 'haldiDress', 'festiveDress', 'weddingDress'] as const;
  const altKeys = ['photoCoupleAlt', 'photoFamilyOneAlt', 'photoFamilyTwoAlt'] as const;
  const captionKeys = ['photoCoupleCaption', 'photoFamilyOneCaption', 'photoFamilyTwoCaption'] as const;
  return {
    ...weddingData,
    groom: t('groom'), bride: t('bride'), groomFull: t('groomFull'), brideFull: t('brideFull'),
    dateLabel: '16 ' + t('month') + ' 2027',
    dateParts: {...weddingData.dateParts, month: t('month'), weekday: t('weekday'), time: t('weddingTime'), timezone: t('timezone')},
    families: {groom: t('groomFamily'), bride: t('brideFamily')},
    invitation: t('invitation'), story: t('story'), engagementNote: t('engagementNote'),
    venue: {...weddingData.venue, name: t('venueName'), address: t('address')},
    contact: {...weddingData.contact, name: t('contactName')},
    photos: weddingData.photos.map((photo, i) => ({...photo, alt: t(altKeys[i]), caption: t(captionKeys[i])})),
    events: weddingData.events.map((event, i) => ({...event,
      name: t(`${eventKeys[i]}Title`), subtitle: t(`${eventKeys[i]}Subtitle`),
      description: t(`${eventKeys[i]}Description`), time: t(timeKeys[i]),
      date: (i === 4 ? '16 ' : '15 ') + t('month') + ' 2027', dress: t(dressKeys[i]),
    })),
  };
}
