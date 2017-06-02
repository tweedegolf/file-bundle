import i18n from 'i18next';
import enGB from '../../../../../locales/en-GB/common.json';
import nlNL from '../../../../../locales/nl-NL/common.json';
import deDE from '../../../../../locales/de-DE/common.json';

console.log('i18n', __dirname);

i18n
.init({
    fallbackLng: 'nl-NL',
    ns: ['common'],
    defaultNS: 'common',
    debug: true,
    resources: {
        'en-GB': {
            common: enGB,
        },
        'nl-NL': {
            common: nlNL,
        },
        'de-DE': {
            common: deDE,
        },
    },
}, (error, t) => {
    if (typeof error !== 'undefined') {
        console.error(error);
    }
    // console.log(t('toolbar.cut'));
});

export default i18n;
