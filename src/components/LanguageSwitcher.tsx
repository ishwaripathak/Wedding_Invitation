import {useLanguage} from '../i18n';
const languages = [{code: 'en', label: 'English'}, {code: 'gu', label: 'ગુજરાતી'}, {code: 'hi', label: 'हिन्दी'}] as const;
export default function LanguageSwitcher() {
  const {language, setLanguage, t} = useLanguage();
  return <nav className="language-switcher" aria-label={t('language')}>
    {languages.map(item => <button key={item.code} type="button" lang={item.code} aria-pressed={language === item.code} onClick={() => setLanguage(item.code)}>{item.label}</button>)}
  </nav>;
}
