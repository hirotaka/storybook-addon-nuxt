import type { UserConfig as ViteConfig } from 'vite';
import type { StorybookConfig } from '@storybook/vue3-vite';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mergeConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import viteJsxPlugin from '@vitejs/plugin-vue-jsx';

export const viteFinal: StorybookConfig['viteFinal'] = async (config) => {
  const nuxtViteConfig = await useNuxtViteConfig();
  const { viteConfig } = nuxtViteConfig;

  // https://github.com/storybookjs/storybook/issues/20817
  if (config.plugins) {
    config.plugins = config.plugins.filter((plugin) => {
      if (
        plugin !== null &&
        typeof plugin === 'object' &&
        'name' in plugin &&
        plugin.name === 'vite:vue'
      ) {
        return false;
      }
      return true;
    });
  }

  return mergeConfig(
    {
      resolve: viteConfig.resolve,
      optimizeDeps: viteConfig.optimizeDeps,
      plugins: viteConfig.plugins,
      define: viteConfig.define,
    },
    config
  );
};

const vuePlugins = {
  'vite:vue': [vuePlugin, 'vue'],
  'vite:vue-jsx': [viteJsxPlugin, 'vueJsx'],
} as const;

async function useNuxtViteConfig() {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit');
  const nuxt = await loadNuxt({
    // cwd: process.cwd(),
    ready: false,
    dev: true,
    overrides: {
      ssr: false,
      app: {
        rootId: 'nuxt-test',
      },
      pages: false,
    },
  });
  if ((nuxt.options.builder as string) !== '@nuxt/vite-builder') {
    throw new Error(
      `Storybook addon Nuxt only supports Vite bundler, but Nuxt builder is currently set to '${nuxt.options.builder}'.`
    );
  }
  const runtimeDir = fileURLToPath(new URL('../runtime', import.meta.url));
  nuxt.options.build.templates.push(
    { src: join(runtimeDir, 'composables.mjs'), filename: 'storybook/composables.mjs' },
    { src: join(runtimeDir, 'components.mjs'), filename: 'storybook/components.mjs' }
  );

  nuxt.hook('app:templates', (app) => {
    app.templates = app.templates.filter((template) => template.filename !== 'app-component.mjs');
    app.templates.push({
      src: join(runtimeDir, 'app-component.mjs'),
      filename: 'app-component.mjs',
    });
  });

  nuxt.hook('imports:sources', (presets) => {
    const stubbedComposables = ['useNuxtApp'];
    const appPreset = presets.find((p) => p.from === '#app');
    if (appPreset) {
      appPreset.imports = appPreset.imports.filter(
        (i) => typeof i !== 'string' || !stubbedComposables.includes(i)
      );
    }
    presets.push({
      from: '#build/storybook/composables.mjs',
      imports: stubbedComposables,
    });
  });

  return {
    viteConfig: await new Promise<ViteConfig>((resolve, reject) => {
      nuxt.hook('modules:done', () => {
        nuxt.hook('components:extend', (components) => {
          for (const name of ['NuxtLink']) {
            Object.assign(components.find((c) => c.pascalName === name) || {}, {
              export: name,
              filePath: '#build/storybook/components.mjs',
            });
          }
        });
        nuxt.hook('vite:extendConfig', (config, { isClient }) => {
          if (isClient) {
            for (const name in vuePlugins) {
              if (!config.plugins?.some((p) => (p as any)?.name === name)) {
                const [plugin, key] = vuePlugins[name as keyof typeof vuePlugins];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                config.plugins.push(plugin(config[key]));
              }
            }
            resolve({ ...config });
          }
        });
      });
      nuxt
        .ready()
        .then(() => buildNuxt(nuxt))
        .catch((err) => {
          if (!err.toString().includes('_stop_')) {
            reject(err);
          }
        });
    }),
    nuxt,
  };
}
