module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // Allow Tailwind v4 CSS-first at-rules
    'at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'theme', 'utility'] }
    ]
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      // Parse <style> blocks in Svelte files
      customSyntax: 'postcss-html'
    }
  ]
};


