# Storybook Addon Nuxt

This add-on makes it easier to set up Storybook in your Nuxt3 project.

## Supported Features

- Auto Imports
- NuxtLink

Since we're still in the early stages of the project, there are several features that we still need to tackle. We're open to hearing your requests for features and will address them in the order we receive them.
Please feel free to [let us know](https://github.com/hirotaka/storybook-addon-nuxt/discussions) what you need without hesitation.

## Requirements

- Nuxt >= 3.x
- Storybook >= 7.x

## Examples

- Nuxt3 - [Source](./examples/nuxt3/)

## Getting Started

### Installation

First setup Storybook.

In your Nuxt project directory:

```
# With npm
npx storybook@latest init --type vue3 --builder vite

# With pnpm
pnpm dlx storybook@latest init --type vue3 --builder vite
```

Install storybook-addon-nuxt using npm:

```
npm install --save-dev storybook-addon-nuxt
```

Or yarn:

```
yarn add --dev storybook-addon-nuxt
```

Or pnpm:

```
pnpm add --dev storybook-addon-nuxt
```

Register the Addon in main.js

```
// .storybook/main.js

module.exports = {
  // other config ommited for brevity
  addons: [
    // ...
    'storybook-addon-nuxt'
    // ...
  ]
}
```
