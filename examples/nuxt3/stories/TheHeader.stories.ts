import type { Meta, StoryObj } from '@storybook/vue3'
import TheHeader from '~/components/TheHeader.vue'

const meta: Meta<typeof TheHeader> = {
  title: 'Example/TheHeader',
  component: TheHeader,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ['autodocs'],
  render: args => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      TheHeader
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup () {
      // Story args can be spread into the returned object
      return {
        ...args
      }
    },
    // Then, the spread values can be accessed directly in the template
    template: '<the-header :user="user" />'
  }),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/vue/configure/story-layout
    layout: 'fullscreen'
  }
}

export default meta

type Story = StoryObj<typeof TheHeader>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'Jane Doe'
    }
  }
}

export const LoggedOut: Story = {
  args: {
    user: null
  }
}
