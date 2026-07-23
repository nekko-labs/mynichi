import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

export default defineConfig({
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
  ],
  environments: {
    // Native Lynx bundle (LynxExplorer / embedded LynxView)
    lynx: {},
    // Lynx for Web: same source rendered in the browser via @lynx-js/web-core
    web: {
      output: {
        assetPrefix: '/',
      },
    },
  },
})
