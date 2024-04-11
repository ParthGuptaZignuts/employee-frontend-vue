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
import { validateEmail, validatePassword, validationRules } from '../../composables/useValidation.js'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const refVForm = ref()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

const handleSubmit = async () => {
  try {
    const validate = await refVForm.value.validate();
    if (!validate.valid) return; 

    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match";
      return;
    }

    const payload = {
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    };

    const response = await axios.post('/api/password/reset', payload);
    successMessage.value = response.data.message;

    // Redirect to login page after password reset
    router.push('/login');

  } catch (error) {
    console.error('API call failed:', error);
    errorMessage.value = error.message;
  }
};

// Fetch the email from the API
const fetchEmail = async () => {
  try {
    const response = await axios.get('password/reset');
    email.value = response.data.email;
    console.log(email.value);
  } catch (error) {
    console.error('Failed to fetch email:', error);
  }
};

onMounted(fetchEmail);
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

      <VCol
        cols="12"
        lg="4"
        class="auth-card-v2 d-flex align-center justify-center"
      >
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
          <VCardText>
            <h5 class="text-h5 mb-1">
              Welcome to
              <span class="text-capitalize"> Reset Your Password Page </span>!
              👋🏻 
            </h5>

            <h3 class="text-h3 mb-4">Welcome, {{ email }}</h3>

            <VAlert
              v-show="errorMessage"
              color="primary"
              variant="tonal"
              dismissible
            >
              <p class="text-caption mb-2">
                {{ errorMessage }}
              </p>
            </VAlert>
          </VCardText>

          <VCardText>
            <VForm ref="refVForm" @submit.prevent="handleSubmit">
              <VRow>
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

                <VCol cols="12">
                  <AppTextField
                    v-model="password"
                    label="Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    :rules="validationRules.password"
                    required
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <VBtn block type="submit" class="mt-4"> Login </VBtn>
                  
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
