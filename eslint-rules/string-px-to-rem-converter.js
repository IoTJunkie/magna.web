module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "convert 'px' units to 'rem' units in strings and template literals",
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [], // no options
  },
  create(context) {
    return {
      Literal(node) {
        checkAndReport(node);
      },
      TemplateLiteral(node) {
        node.quasis.forEach((element) => {
          checkAndReport(element);
        });
      },
    };

    function checkAndReport(node) {
      const text = node.value || (node.type === 'TemplateElement' && node.value.raw);
      if (!text) return;

      // Regex to match entire bracketed expression
      const bracketRegex = /\[.*?\]/g;
      let modifiedText = text;
      let bracketMatch;

      while ((bracketMatch = bracketRegex.exec(text)) !== null) {
        const bracketContent = bracketMatch[0];
        const pxRegex = /([\d.]+)px/g;
        let innerMatch;
        let modifiedBracketContent = bracketContent;

        while ((innerMatch = pxRegex.exec(bracketContent)) !== null) {
          const pxValue = innerMatch[1];
          const matchedString = innerMatch[0];
          let replacement;

          if (pxValue === '0') {
            replacement = '0';
          } else {
            const remValue = `${parseFloat(pxValue) / 16}rem`;
            replacement = remValue;
          }

          modifiedBracketContent = modifiedBracketContent.replace(matchedString, replacement);
        }

        if (modifiedBracketContent !== bracketContent) {
          modifiedText = modifiedText.replace(bracketContent, modifiedBracketContent);
        }
      }

      if (modifiedText !== text) {
        context.report({
          node,
          message: "Found 'px' unit within brackets, consider using 'rem' unit instead.",
          fix(fixer) {
            if (node.type === 'TemplateElement') {
              return fixer.replaceTextRange([node.range[0] + 1, node.range[1] - 1], modifiedText);
            }
            return fixer.replaceText(node, JSON.stringify(modifiedText));
          },
        });
      }
    }
  },
};
