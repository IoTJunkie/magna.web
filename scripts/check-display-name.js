const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const checkDisplayName = (filePath) => {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let hasDisplayName = false;
  let componentName = null;

  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.init && path.node.init.type === 'ArrowFunctionExpression') {
        componentName = path.node.id.name;
      }
    },
    AssignmentExpression(path) {
      if (path.node.left.property && path.node.left.property.name === 'displayName') {
        hasDisplayName = true;
      }
    },
  });

  if (componentName && !hasDisplayName) {
    console.warn(`Component ${componentName} in file ${filePath} does not have a displayName set.`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      checkDisplayName(filePath);
    }
  }
};

const startPath = path.resolve(__dirname, '../src'); // replace 'src' with the path to your source code
walk(startPath);
