<script setup lang="ts">
import '~/assets/button.css'

import { computed } from 'vue'

type Props = {
  label: string
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
  backgroundColor?: string
}

type Emit = {
  (event: 'click'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const classes = computed(() => ({
  'storybook-button': true,
  'storybook-button--primary': props.primary,
  'storybook-button--secondary': !props.primary,
  [`storybook-button--${props.size || 'medium'}`]: true
}))

const style = computed(() => ({
  backgroundColor: props.backgroundColor
}))

const onClick = () => {
  emit('click')
}
</script>
<template>
  <button type="button" :class="classes" :style="style" @click="onClick">
    {{ label }}
  </button>
</template>
