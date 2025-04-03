module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "suggest using 'rem' units instead of 'px' in JSX style objects",
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [], // No options
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Target only 'style' attributes with object expressions
        if (
          node.name.name !== 'style' ||
          !node.value ||
          node.value.expression.type !== 'ObjectExpression'
        ) {
          return;
        }

        node.value.expression.properties.forEach((property) => {
          // Process properties with literal values containing 'px'
          if (
            property.value.type === 'Literal' &&
            typeof property.value.value === 'string' &&
            property.value.value.includes('px')
          ) {
            const sourceCode = context.getSourceCode();
            const originalText = sourceCode.getText(property.value);

            const newValue = originalText.replace(/([\d.]+)px/g, (_, pxValue) => {
              const remValue = parseFloat(pxValue) / 16; // Assuming 16px = 1rem
              // Return '0' if remValue is 0, otherwise append 'rem'
              return remValue === 0 ? '0' : `${remValue}rem`;
            });

            context.report({
              node: property.value,
              message: `Use 'rem' units instead of 'px'.`,
              fix(fixer) {
                return fixer.replaceText(property.value, `${newValue}`);
              },
            });
          }
        });
      },
    };
  },
};
