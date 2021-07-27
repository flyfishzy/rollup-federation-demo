const path = require('path');

function moduleMap(exposes, rawFile, distFile) {
    for (let key in exposes) {
        const exposeFile = path.resolve(exposes[key]);
        if (rawFile.indexOf(exposeFile) === 0) {
            return `"${key}": () => {  return import('http://localhost:8081/${distFile}').then(({ default: apply }) => (()=> (apply())))},\n`
        }
    }
    return '';
}

export default function federation(options) {
    return {
        name: 'federation',

        generateBundle(_options, bundle) {
            let modules = '';
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    modules += moduleMap(options.exposes, chunk.facadeModuleId, chunk.fileName);
                }
            }

            const code = `var moduleMap={
    ${modules}
};
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

            this.emitFile({
                fileName: options.filename,
                type: 'asset',
                source: code
            })
        }
    }
}