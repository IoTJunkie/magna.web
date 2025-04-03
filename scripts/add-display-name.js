const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const addDisplayName = (filePath) => {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let componentName = null;
  let shouldAddDisplayName = true;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      if (path.node.declaration.type === 'Identifier') {
        componentName = path.node.declaration.name;
      }
    },
    AssignmentExpression(path) {
      if (path.node.left.property && path.node.left.property.name === 'displayName') {
        shouldAddDisplayName = false;
      }
    },
  });

  if (componentName && shouldAddDisplayName) {
    const newCode = `${code}\n${componentName}.displayName = "${componentName}";`;
    fs.writeFileSync(filePath, newCode, 'utf-8');
    console.log(`Added displayName to ${componentName} in ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx')) {
      addDisplayName(filePath);
    }
  }
};

const startPath = path.resolve(__dirname, '../src'); // replace 'src' with the path to your source code
walk(startPath);
