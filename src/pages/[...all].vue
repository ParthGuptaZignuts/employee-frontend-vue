<script setup>
// necessary imports
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import misc404 from '@images/pages/404.png'
import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'

// constants
const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)
</script>

<!-- template section -->
<template>
  <div class="misc-wrapper">
    <ErrorHeader
      error-title="Page Not Found :("
      error-description="We couldn't find the page you are looking for."
    />
    <VBtn
      to="/"
      class="mb-12"
    >
      Back to Home
    </VBtn>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="misc404"
        :max-width="200"
        alt="Coming Soon"
        class="mx-auto"
      />
    </div>

    <VImg
      :src="authThemeMask"
      class="misc-footer-img d-none d-md-block"
    />
  </div>
</template>

<!-- style section -->
<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
