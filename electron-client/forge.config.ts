/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ForgeConfig } from '@electron-forge/shared-types';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './packaging/icon',
    name: 'Flash Banger',
    executableName: 'flashbanger',
    osxSign: {
      keychain: "build.keychain",
      strictVerify: false,
      identity: `Developer ID Application: mappso (${process.env.APPLE_TEAM_ID!})`,
      identityValidation: false,
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID!,
      appleIdPassword: process.env.APPLE_ID_PASSWORD!,
      teamId: process.env.APPLE_TEAM_ID!
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033,
        manufacturer: 'Mappso',
        description: 'Flash Banger is a free and open-source flashbang app.',
        shortcutFolderName: 'Flash Banger',
        shortcutName: 'Flash Banger',
        shortcutDescription: 'Flash Banger Application',
        icon: './packaging/icon.ico'
      },
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        overwrite: true,
        background: './packaging/background.png',
        format: 'ULFO',
        icon: './packaging/icon.icns',
        contents:
          function (opts: { appPath: string }) {
            return [{ x: 344, y: 349, type: 'link', path: '/Applications' },
            { x: 344, y: 144, type: 'file', path: opts.appPath }];
          }
      }
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        maintainer: 'Mappso <team@mappso.com>',
        homepage: 'https://flashbanger.com',
        description: 'Flash Banger is a free and open-source flashbang app.',
        productName: 'Flash Banger',
        genericName: 'Flashbang App',
        categories: ['Utility'],
        icon: './packaging/icon.png',
        productDescription: 'Flash Banger is a free and open-source flashbang app.'
      }
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'tomilodk',
          name: 'flash-banger'
        },
        prerelease: true,
        release: true
      }
    }
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:`,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
