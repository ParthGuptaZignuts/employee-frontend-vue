<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'
import axios from "../../axiosFile"
import { validationRules } from '../../composables/useValidation.js'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const router = useRouter()
const isPasswordVisible = ref(false)
const refVForm = ref()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const validatePasswordMatch = () => {
  return confirmPassword.value === password.value || 'Passwords do not match'
}

const handleSubmit = async () => {
  try {
    const validate = await refVForm.value.validate()
    if (!validate.valid) return

    const token = window.location.pathname.split('/').pop() 
    const payload = {
      email: email.value,
      token: token,
      password: password.value,
      password_confirmation: confirmPassword.value,
    }
    console.log(payload);
    const response = await axios.post('/password/reset', payload)
    console.log(response.data);
    successMessage.value = response.data.message

    router.push('/login')
  } catch (error) {
    console.error('API call failed:', error)
    errorMessage.value = error.response.data.message || 'Failed to reset password'
  }
}
</script>

<template>
  <div>
    <VRow no-gutters class="auth-wrapper bg-surface">
      <VCol lg="8" class="d-none d-lg-flex">
        <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
          <div class="d-flex align-center justify-center w-100 h-100">
            <VImg
              max-width="505"
              :src="authThemeImg"
              class="auth-illustration mt-16 mb-2"
            />
          </div>

          <VImg :src="authThemeMask" class="auth-footer-mask" />
        </div>
      </VCol>

      <!-- Form Column -->
      <VCol cols="12" lg="4" class="auth-card-v2 d-flex align-center justify-center">
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
          <VCardText>
            <h5 class="text-h5 mb-1">
              Welcome to
              <span class="text-capitalize"> Reset Your Password Page </span>!
              👋🏻 
            </h5>

            <VAlert
              v-show="errorMessage"
              color="error"
              variant="outlined"
              dismissible
            >
              {{ errorMessage }}
            </VAlert>

            <VAlert
              v-show="successMessage"
              color="success"
              variant="outlined"
              dismissible
            >
              {{ successMessage }}
            </VAlert>
          </VCardText>

          <VCardText>
            <VForm ref="refVForm" @submit.prevent="handleSubmit">
              <VRow>
                <!-- Email Field -->
                <VCol cols="12">
                  <AppTextField
                    v-model="email"
                    label="Email"
                    type="email"
                    :rules="validationRules.email"
                    autofocus
                    required
                  />
                </VCol>

                <!-- Password Field -->
                <VCol cols="12">
                  <AppTextField
                    v-model="password"
                    label="Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    :rules="validationRules.password"
                    required
                    @click:append-inner="togglePasswordVisibility"
                  />
                </VCol>

                <!-- Confirm Password Field -->
                <VCol cols="12">
                  <AppTextField
                    v-model="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    :rules="[validationRules.confirmPassword, validatePasswordMatch]"
                    required
                  />
                </VCol>

                <!-- Submit Button -->
                <VCol cols="12">
                  <VBtn block type="submit" class="mt-4"> Reset Password </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
</route>
