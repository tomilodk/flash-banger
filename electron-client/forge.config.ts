import type { ForgeConfig } from '@electron-forge/shared-types';

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
    name: 'Flash Banger'
  },
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033,
        manufacturer: 'Mappso'
      }
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
      config: {}
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