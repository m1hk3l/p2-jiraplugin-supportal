/* ============================================================================
 * Supportal frontend build.
 *
 * Three jobs (docs/ARCHITECTURE.md §5.2):
 *   1. Transpile JSX (babel-loader).
 *   2. Externalize react / react-dom to Jira DC 10.3's HOST-PROVIDED React
 *      18.3.1 AMD modules — we never bundle React (Jira 10 rule; learning/08).
 *   3. Generate the <web-resource> descriptors for the bundle, including the
 *      <dependency> entries on Jira's React web-resources, into
 *      META-INF/plugin-descriptors/wr-defs.xml. The plugin framework merges
 *      that fragment at load time; it is a build artifact (gitignored) and is
 *      NEVER copied into atlassian-plugin.xml by hand.
 *
 * Each entry below becomes a web-resource named  entrypoint-<entryName>,
 * i.e. the current entry yields:
 *      com.enefit.fnd.supportal:entrypoint-supportal-react
 * which SupportalServlet requires via PageBuilderService (ARCHITECTURE §5.3).
 * ========================================================================== */

/* VERSION PIN (verified empirically, 2026-07): webpack is pinned to exactly
 * 5.94.0 in package.json. atlassian-webresource-webpack-plugin 7.0.1 requires
 * webpack/lib/DllModule, which later webpack 5.10x releases moved — newer
 * webpack fails at config load with MODULE_NOT_FOUND. When bumping either,
 * re-run `npm run build` and check the emitted bundle still contains
 * require("atlassian/libs/react") externals and wr-defs.xml is regenerated. */
const path = require('path');
const WrmPlugin = require('atlassian-webresource-webpack-plugin');

/* Must match <atlassian.plugin.key> in pom.xml: groupId.artifactId */
const PLUGIN_KEY = 'com.enefit.fnd.supportal';

const OUTPUT_DIR = path.resolve(__dirname, '../resources/frontend');
const WR_XML = path.resolve(
    __dirname,
    '../resources/META-INF/plugin-descriptors/wr-defs.xml'
);

module.exports = (env, argv) => {
    const isDev = argv && argv.mode === 'development';

    return {
        entry: {
            /* one shared island bundle for now; add entries per-area if it grows */
            'supportal-react': './src/islands.js',
        },

        output: {
            path: OUTPUT_DIR,
            filename: '[name].js',
            clean: true,
        },

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
            ],
        },

        resolve: { extensions: ['.js', '.jsx'] },

        plugins: [
            new WrmPlugin({
                pluginKey: PLUGIN_KEY,
                xmlDescriptors: WR_XML,

                /* Bundles land in src/main/resources/frontend/, i.e. at
                 * /frontend/... inside the jar; the generated <resource>
                 * locations must carry that prefix to resolve at runtime. */
                locationPrefix: 'frontend/',

                /* Loadable by context as well as by direct require. */
                contextMap: {
                    'supportal-react': ['supportal'],
                },

                /* THE crucial part: import React from 'react' resolves at
                 * runtime to Jira's AMD module, and the generated
                 * web-resource depends on Jira's React web-resources so the
                 * WRM loads them first. Module names verified for DC 10.3
                 * (learning/08); re-verify on upgrade via ?reactcheck. */
                providedDependencies: {
                    react: {
                        dependency: 'com.atlassian.plugins.react:react-core-amd',
                        import: {
                            var: "require('atlassian/libs/react')",
                            amd: 'atlassian/libs/react',
                        },
                    },
                    'react-dom': {
                        dependency: 'com.atlassian.plugins.react:react-dom-amd',
                        import: {
                            var: "require('atlassian/libs/react-dom')",
                            amd: 'atlassian/libs/react-dom',
                        },
                    },
                    /* React 18 createRoot lives on the same react-dom object
                     * in the host's AMD build. */
                    'react-dom/client': {
                        dependency: 'com.atlassian.plugins.react:react-dom-amd',
                        import: {
                            var: "require('atlassian/libs/react-dom')",
                            amd: 'atlassian/libs/react-dom',
                        },
                    },
                },
            }),
        ],

        devtool: isDev ? 'inline-source-map' : false,
    };
};
