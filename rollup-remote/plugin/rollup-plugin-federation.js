const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry';
const moduleMapMarker = '__ROLLUP_FEDERATION_MODULE_MAP__';

export default function federation(options) {
    const provideExposes = options.exposes || {};
    const exposeId = new Map();
    const code =
        `${moduleMapMarker}
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

    return {
        name: 'federation',

        options(_options) {
            // Split expose & shared module to separate chunks
            const manualChunks = _options.output[0].manualChunks || {};
            Object.keys(provideExposes).forEach((id) => {
                const newId = id.replace(/[^a-zA-Z0-9]/g, '');
                exposeId.set(newId, id);
                manualChunks[newId] = [provideExposes[id]];
            });
            _options.output[0].manualChunks = manualChunks;
            return _options;
        },

        buildStart(_options) {
            this.emitFile({
                fileName: options.filename,
                type: 'chunk',
                id: remoteEntryHelperId,
                preserveSignature:"strict"
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
                if (chunk.type === 'chunk' && exposeId.has(chunk.name)) {
                    modules += `"${exposeId.get(chunk.name)}": () => {  return import('http://localhost:8081/${chunk.fileName}').then(({ default: apply }) => (()=> (apply())))},\n`
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