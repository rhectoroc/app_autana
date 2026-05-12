import { create } from 'zustand';
import { translations } from '../utils/translations';

type Language = 'en' | 'es';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
}

export const useLanguageStore = create<LanguageState>((set) => ({
    language: 'en', // Default to English as per original design, user can toggle
    setLanguage: (lang) => set({ language: lang }),
    get t() {
        // This is a bit tricky with zustand state access inside the object definition if not using get().
        // However, standard pattern is to use a hook in components. 
        // We will expose a derived getter or just rely on state.
        return translations['en'];
    }
}));

// Helper hook to get current translations
export const useTranslation = () => {
    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);
    return {
        t: translations[language],
        language,
        setLanguage,
        toggleLanguage: () => setLanguage(language === 'en' ? 'es' : 'en')
    };
};
