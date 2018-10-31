import buble from 'rollup-plugin-buble';

export default {
    input: 'src/react.js',
    plugins: [buble({ objectAssign: true })],
    output: {
        strict: false,
        interop: false,
        file: 'react.js',
        format: 'cjs',
    },
};
