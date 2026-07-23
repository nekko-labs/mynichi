// Browser harness for the Lynx PoC: registers <lynx-view> (web-core client)
// and the web implementations of Lynx elements, then the page loads
// main.web.bundle. In this web-core version the client bundle includes the
// element registry, and web-elements provides the element web components.
import '@lynx-js/web-core/client'
import '@lynx-js/web-elements/all'
import '@lynx-js/web-elements/index.css'
