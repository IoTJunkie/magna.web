module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "detect and convert 'px' units to 'rem' units in Tailwind CSS class names, skipping '0' sizes",
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Ensure that we are looking at a className attribute
        if (node.name.name !== 'className' || !node.value || node.value.type !== 'Literal') {
          return;
        }

        const sourceCode = context.getSourceCode();
        const classNameRawValue = sourceCode.getText(node.value);
        const quoteType = classNameRawValue.startsWith("'") ? "'" : '"';

        // Regular expression to match 'px' units within '[]'
        const pxRegex = /\[\s*[^[\]]*?([\d.]+)px[^[\]]*?\]/g;
        let match;
        let hasReported = false;

        while ((match = pxRegex.exec(classNameRawValue)) !== null) {
          if (!hasReported) {
            // Report the first instance and replace all 'px' units within '[]'
            let fixedClassNameValue = classNameRawValue.replace(pxRegex, (matched) => {
              return matched.replace(/([\d.]+)px/g, (_, number) => {
                if (number === '0') {
                  return '0'; // Return '0' as is for zero values
                }
                const remValue = parseFloat(number) / 16; // Assuming 16px = 1rem
                return `${remValue}rem`;
              });
            });

            context.report({
              node,
              message: `Replace 'px' units with 'rem' units in className.`,
              fix(fixer) {
                return fixer.replaceText(node.value, fixedClassNameValue);
              },
            });

            hasReported = true;
          }
        }
      },
    };
  },
};
