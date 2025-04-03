module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce proper usage of the classnames utility function',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/JedWatson/classnames',
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.name === 'classNames') {
          node.arguments.forEach((arg) => {
            // Check for ConditionalExpression or BinaryExpression with '+' operator
            if (
              arg.type === 'ConditionalExpression' ||
              (arg.type === 'BinaryExpression' && arg.operator === '+')
            ) {
              context.report({
                node: arg,
                message: 'Avoid using conditional logic inside classNames function.',
              });
            }
          });
        }
      },
      // Listener for JSXExpressionContainer
      JSXExpressionContainer(node) {
        if (
          node.expression.type === 'CallExpression' &&
          node.expression.callee.name === 'classNames'
        ) {
          node.expression.arguments.forEach((arg) => {
            if (arg.type === 'LogicalExpression' || arg.type === 'ConditionalExpression') {
              context.report({
                node: arg,
                message: 'Avoid using conditional logic inside classNames function.',
              });
            }
          });
        }
      },
    };
  },
};
