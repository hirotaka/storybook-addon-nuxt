import type { UserConfig as ViteConfig } from 'vite';
import type { StorybookConfig } from '@storybook/vue3-vite';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mergeConfig } from 'vite';

const runtimeDir = fileURLToPath(new URL('../runtime', import.meta.url));

export const viteFinal: StorybookConfig['viteFinal'] = async (config) => {
  const { viteConfig } = await initNuxt();

  if (config.plugins) {
    config.plugins = config.plugins.filter((plugin) => {
      return (plugin as any).name !== 'vite:vue';
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

async function initNuxt() {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit');

  const nuxt = await loadNuxt({
    // cwd: process.cwd(),
    ready: false,
    dev: process.env.NODE_ENV === 'development',
    overrides: {
      ssr: false,
      app: {
        rootId: 'nuxt-test',
      },
      pages: false,
      // debug: true,
    },
  });

  if ((nuxt.options.builder as string) !== '@nuxt/vite-builder') {
    throw new Error(
      `Storybook addon Nuxt only supports Vite bundler, but Nuxt builder is currently set to '${nuxt.options.builder}'.`
    );
  }

  nuxt.options.build.templates.push(
    { src: join(runtimeDir, 'composables.mjs'), filename: 'storybook/composables.mjs' },
    { src: join(runtimeDir, 'components.mjs'), filename: 'storybook/components.mjs' }
  );

  stubApp();
  stubComposables();
  stubComponents();

  const [viteConfig] = await Promise.all([waitForConfig(), waitForNuxt()]);

  function stubApp() {
    nuxt.hook('app:templates', (app) => {
      app.templates = app.templates.filter((template) => template.filename !== 'app-component.mjs');
      app.templates.push({
        src: join(runtimeDir, 'app-component.mjs'),
        filename: 'app-component.mjs',
      });
    });
  }

  function stubComposables() {
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
  }

  function stubComponents() {
    nuxt.hook('components:extend', (components) => {
      for (const name of ['NuxtLink']) {
        const component = components.find((c) => c.pascalName === name);

        if (component) {
          Object.assign(component, {
            export: name,
            filePath: '#build/storybook/components.mjs',
          });
        }
      }
    });
  }

  async function waitForConfig() {
    return new Promise<ViteConfig>((resolve) => {
      nuxt.hook('vite:extendConfig', (config, { isClient }) => {
        if (isClient) {
          resolve(config);
        }
      });
    });
  }

  async function waitForNuxt() {
    try {
      await nuxt.ready();
      await buildNuxt(nuxt);
    } catch (err) {
      if (!err.toString().includes('_stop_')) {
        throw err;
      }
    }
  }

  return {
    viteConfig,
    nuxt,
  };
}
