import i18n from 'i18next';

console.log(__dirname);

i18n.configure({
    locales: ['en', 'de', 'nl'],
    directory: `${__dirname}/locales`,
});

export default i18n;
