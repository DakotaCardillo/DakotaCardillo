module.exports = {
    extends: ['stylelint-config-standard'],
    overrides: [
        {
            files: ['**/*.css','**/*.svelte'],
            customSyntax: 'postcss-html', // lets stylelint parse <style> in Svelte
        }
    ],
    rules: {
        'at-rule-no-unknown': [true, {
            ignoreAtRules: ['tailwind','apply','variants','responsive','screen','theme','utility']
        }]
    }
};