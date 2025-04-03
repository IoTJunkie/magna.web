const { generateApi, generateTemplates } = require('swagger-typescript-api');
const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');

let envFilePath;

if (fs.existsSync('.env.local')) {
  envFilePath = '.env.local';
} else if (fs.existsSync('.env.development')) {
  envFilePath = '.env.development';
} else {
  envFilePath = '.env';
}

dotenv.config({ path: envFilePath });

const baseUrl = process.env.NEXT_PUBLIC_ENDPOINT_URL;

// Read and parse the local swagger.json file
const swaggerSpec = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), './swagger.json'), 'utf8'),
);

/* NOTE: all fields are optional expect one of `output`, `url`, `spec` */
generateApi({
  name: 'api.ts',
  // set to `false` to prevent the tool from writing to disk
  output: path.resolve(process.cwd(), './src/app/api/__generated__'),
  spec: swaggerSpec, // Using the parsed spec here
  url: `${baseUrl}/swagger.json`,
  apiConfig: {
    baseUrl,
  },
  sortTypes: true,
  httpClientType: 'fetch', // or "axios"
  defaultResponseAsSuccess: false,
  generateClient: true,
  generateRouteTypes: false,
  generateResponses: true,
  toJS: false,
  extractRequestParams: false,
  extractRequestBody: false,
  extractEnums: false,
  unwrapResponseData: false,
  prettier: {
    // By default prettier config is load from your project
    printWidth: 120,
    tabWidth: 2,
    trailingComma: 'all',
    parser: 'typescript',
  },
  defaultResponseType: 'void',
  singleHttpClient: false,
  cleanOutput: false,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  typePrefix: '',
  typeSuffix: '',
  enumKeyPrefix: '',
  enumKeySuffix: '',
  addReadonly: false,
  extractingOptions: {
    requestBodySuffix: ['Payload', 'Body', 'Input'],
    requestParamsSuffix: ['Params'],
    responseBodySuffix: ['Data', 'Result', 'Output'],
    responseErrorSuffix: ['Error', 'Fail', 'Fails', 'ErrorData', 'HttpError', 'BadResponse'],
  },
  /** allow to generate extra files based with this extra templates, see more below */
  extraTemplates: [],
  anotherArrayType: false,
  fixInvalidTypeNamePrefix: 'Type',
  fixInvalidEnumKeyPrefix: 'Value',
  // codeGenConstructs: (constructs) => ({
  //   ...constructs,
  //   RecordType: (key, value) => `MyRecord<key, value>`,
  // }),
  primitiveTypeConstructs: (constructs) => ({
    ...constructs,
    string: {
      //  "date-time": "Date",
    },
  }),
  hooks: {
    onCreateComponent: (component) => {},
    onCreateRequestParams: (rawType) => {},
    onCreateRoute: (routeData) => {},
    onCreateRouteName: (routeNameInfo, rawRouteInfo) => {},
    onFormatRouteName: (routeInfo, templateRouteName) => {},
    onFormatTypeName: (typeName, rawTypeName, schemaType) => {},
    onInit: (configuration) => {},
    onPreParseSchema: (originalSchema, typeName, schemaType) => {},
    onParseSchema: (originalSchema, parsedSchema) => {},
    onPrepareConfig: (currentConfiguration) => {},
  },
})
  .then(({ files, configuration }) => {
    files.forEach(({ content, name }) => {
      fs.writeFile(path, content);
    });
  })
  .catch((e) => {
    console.error('Error encountered while generating API:', e.message);
    if (e.codeFrame) {
      console.error('Code frame:', e.codeFrame);
    }
  });

// generateTemplates({
//   cleanOutput: false,
//   output: "__generated__",
//   httpClientType: "fetch",
//   modular: false,
//   silent: false,
//   rewrite: false,
// });
