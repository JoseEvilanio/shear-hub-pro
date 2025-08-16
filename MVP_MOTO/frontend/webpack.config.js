// Configuração de Webpack para Otimizações
// Sistema de Gestão de Oficina Mecânica de Motos

const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    // Otimizações de performance
    optimization: {
      // Code splitting
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk para bibliotecas
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Chunk para componentes comuns
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Chunk específico para React
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Chunk para bibliotecas de UI
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // Chunk para utilitários
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|axios)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 12,
          },
        },
      },
      // Minimização
      minimize: isProduction,
      // Runtime chunk separado
      runtimeChunk: 'single',
    },

    // Plugins
    plugins: [
      // Compressão Gzip em produção
      ...(isProduction ? [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        }),
      ] : []),

      // Bundle analyzer (apenas quando solicitado)
      ...(process.env.ANALYZE ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        }),
      ] : []),

      // Define de ambiente
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      }),

      // Prefetch de recursos importantes
      new webpack.PrefetchPlugin('./src/utils/lazyComponents.ts'),
      new webpack.PrefetchPlugin('./src/utils/cache.ts'),
    ],

    // Configurações de módulo
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { 
                    targets: '> 0.25%, not dead',
                    useBuiltIns: 'usage',
                    corejs: 3,
                  }],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  // Lazy loading de componentes
                  '@babel/plugin-syntax-dynamic-import',
                  // Tree shaking
                  ['import', {
                    libraryName: 'lodash',
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                  }, 'lodash'],
                ],
              },
            },
          ],
        },

        // CSS
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'tailwindcss',
                    'autoprefixer',
                    ...(isProduction ? ['cssnano'] : []),
                  ],
                },
              },
            },
          ],
        },

        // Imagens
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
          use: [
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 80,
                },
                optipng: {
                  enabled: false,
                },
                pngquant: {
                  quality: [0.65, 0.90],
                  speed: 4,
                },
                gifsicle: {
                  interlaced: false,
                },
                webp: {
                  quality: 80,
                },
              },
            },
          ],
        },

        // Fontes
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // Resolve
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // Fallbacks para Node.js modules
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
      },
    },

    // Cache
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    // Configurações de desenvolvimento
    ...(isDevelopment && {
      devtool: 'eval-source-map',
      devServer: {
        hot: true,
        compress: true,
        historyApiFallback: true,
        client: {
          overlay: {
            errors: true,
            warnings: false,
          },
        },
      },
    }),

    // Configurações de produção
    ...(isProduction && {
      devtool: 'source-map',
      performance: {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      },
    }),

    // Externals para CDN (opcional)
    externals: isProduction ? {
      // 'react': 'React',
      // 'react-dom': 'ReactDOM',
    } : {},
  };
};