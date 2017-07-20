import i18n from 'i18next';
import en from '../locales/en/common.json';
import de from '../locales/de/common.json';
import nl from '../locales/nl/common.json';

i18n
    .init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
            en: {
                common: en,
            },
            de: {
                common: de,
            },
            nl: {
                common: nl,
            },
        },
        ns: ['common'],
        defaultNS: 'common',
        debug: false,
        wait: false,
    });

export default i18n;
