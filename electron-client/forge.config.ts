import type { ForgeConfig } from '@electron-forge/shared-types';

require('dotenv').config();

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    osxSign: {},
    osxNotarize: {
      appleId: process.env.APPLE_ID!,
      appleIdPassword: process.env.APPLE_ID_PASSWORD!,
      teamId: process.env.APPLE_TEAM_ID!,
    },
    icon: './packaging/icon',
    name: 'Flash Banger',
    executableName: 'flashbanger'
  },
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033,
        manufacturer: 'Mappso',
        shortcutFolderName: 'Flash Banger',
        shortcutName: 'Flash Banger',
        shortcutDescription: 'Flash Banger Application'
      },
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        background: './packaging/background.png',
        format: 'ULFO'
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
        productDescription: 'Flash Banger is a free and open-source flashbang app.',
        executableName: 'flashbanger' // This needs to match the executable name from packagerConfig
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
        prerelease: true
      }
    }
  ]
};

export default config;