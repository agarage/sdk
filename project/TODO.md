# TODO

- Add permission system for plugin fetch and event systems
  - (only explicitly allowed plugins can fetch and emit certain events)
  - for e.g., the plugin hello-world can only listen to event 'theme-toggle.onThemeChange' (which can come from theme-toggle plugin), if the user configured explicitly host settings for hello-world to listen to events 'theme-toggle.onThemeChange' or 'theme-toggle'.
- Improve security on message
- Deploy plugin SDK as CDN

- Allow plugins to expose slots for other plugins to be injected into by the host.
