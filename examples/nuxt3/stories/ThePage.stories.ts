import { within, userEvent } from '@storybook/testing-library'
import type { Meta, StoryObj } from '@storybook/vue3'
import ThePage from '~/components/ThePage.vue'

const meta: Meta<typeof ThePage> = {
  title: 'Example/ThePage',
  component: ThePage,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/vue/configure/story-layout
    layout: 'fullscreen'
  }
}

export default meta

type Story = StoryObj<typeof ThePage>;
export const LoggedOut: Story = {}

// More on interaction testing: https://storybook.js.org/docs/vue/writing-tests/interaction-testing
export const LoggedIn: Story = {
  render: () => ({
    components: {
      ThePage
    },
    template: '<the-page />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const loginButton = await canvas.getByRole('button', {
      name: /Log in/i
    })
    await userEvent.click(loginButton)
  }
}
