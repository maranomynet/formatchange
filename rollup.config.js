import buble from 'rollup-plugin-buble';
import { uglify } from 'rollup-plugin-uglify';

export default [
    {
        input: 'src/react.js',
        plugins: [buble({ objectAssign: true })],
        output: {
            strict: false,
            interop: false,
            file: 'react.js',
            format: 'cjs',
        },
    },
    {
        input: 'formatchange.js',
        plugins: [uglify({ sourcemap:true, output:{ comments:'some' } })],
        output: {
            strict: false,
            interop: false,
            file: 'formatchange-min.js',
            format: 'cjs',
        },
    },
];
