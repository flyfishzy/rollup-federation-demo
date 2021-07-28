const path = require('path');

const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry';
const moduleMapMarker = '__ROLLUP_FEDERATION_MODULE_MAP__';

function moduleMap(exposes, rawFile, distFile) {
    for (let key in exposes) {
        const exposeFile = path.resolve(exposes[key]);
        if (rawFile.indexOf(exposeFile) === 0) {
            return `"${key}": () => {  return import('http://localhost:8081/${distFile}').then(({ default: apply }) => (()=> (apply())))},\n`
        }
    }
    return '';
}
const code =
    `${moduleMapMarker}
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

export default function federation(options) {
    return {
        name: 'federation',

        buildStart(_options) {
            this.emitFile({
                fileName: options.filename,
                type: 'chunk',
                id: remoteEntryHelperId
            })
        },

        resolveId(source, importer) {
            if (source === remoteEntryHelperId)
                return source
            return null;
        },

        load(id) {
            if (id === remoteEntryHelperId) {
                return {
                    code,
                    moduleSideEffects: "no-treeshake"
                }
            }
            return null
        },

        generateBundle(_options, bundle) {
            let modules = '';
            let remoteEntry;
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    modules += moduleMap(options.exposes, chunk.facadeModuleId, chunk.fileName);
                }
                if (chunk.fileName === options.filename) {
                    remoteEntry = chunk;
                }
            }
            remoteEntry.code = remoteEntry.code.replace(moduleMapMarker,
                `let moduleMap={ ${modules} }`);
        }
    }
}