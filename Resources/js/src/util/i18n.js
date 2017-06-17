import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
// import Cache from 'i18next-localstorage-cache';
// import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(XHR)
//   .use(Cache)
//   .use(LanguageDetector)
    .init({
        fallbackLng: 'en-GB',

    //   have a common namespace used around the full app
        ns: ['common'],
        defaultNS: 'common',

        debug: false,

        wait: false,

      // cache: {
      //   enabled: true
      // },

        interpolation: {
            escapeValue: false, // not needed for react!!
            formatSeparator: ',',
            format(value, format, lng) {
                if (format === 'uppercase') {
                    return value.toUpperCase();
                }
                return value;
            },
            interpolation: {
              // not used!
                format(value, format, lng) {
                    if (format === 'error.delete') {
                        if (typeof value === 'undefined') {
                            return 'bummer';
                        }
                    }
                    return value;
                },
            },
        },

        backend: {
            loadPath: 'locales/{{lng}}/{{ns}}.json',
        },
    });

export default i18n;
