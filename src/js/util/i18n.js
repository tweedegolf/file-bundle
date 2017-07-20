import i18n from 'i18next';

i18n
    .init({
        lng: 'en',
        fallbackLng: 'en',
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        // have a common namespace used around the full app
        ns: ['common'],
        defaultNS: 'common',
        debug: false,
        wait: false,
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
    });

export default i18n;
