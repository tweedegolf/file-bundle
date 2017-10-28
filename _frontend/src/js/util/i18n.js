import i18n from 'i18next';
import enCommon from '../locales/en/common.json';
import deCommon from '../locales/de/common.json';
import nlCommon from '../locales/nl/common.json';

i18n
    .init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
            en: {
                common: enCommon,
            },
            de: {
                common: deCommon,
            },
            nl: {
                common: nlCommon,
            },
        },
        ns: ['common'],
        defaultNS: 'common',
        debug: false,
        wait: false,
    });

export default i18n;
