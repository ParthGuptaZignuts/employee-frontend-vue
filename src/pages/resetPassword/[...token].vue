<script setup>
// Importing necessary functions and components
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png"; 
import authV2MaskDark from "@images/pages/misc-mask-dark.png"; 
import authV2MaskLight from "@images/pages/misc-mask-light.png"; 
import { useRouter } from "vue-router";
import { VForm } from "vuetify/components/VForm";
import axios from "../../axiosFile"; 
import { validationRules } from "../../composables/useValidation.js"; 
import { toast } from "vue3-toastify"; 
import "vue3-toastify/dist/index.css"; 

// Generate image variant based on theme
const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);
// Generate mask image based on theme
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

// Reactive variables and references
const router = useRouter();
const isPasswordVisible = ref(false);
const refVForm = ref(); 
const email = ref(""); 
const password = ref(""); 
const confirmPassword = ref(""); 
const confirmPasswordVisible = ref(false);

// Function to toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

// Function to toggle confirm password visibility
const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value;
};

// Function to validate password match
const validatePasswordMatch = () => {
  return confirmPassword.value === password.value || "Passwords do not match";
};

// Function to handle form submission
const handleSubmit = async () => {
  try {
    // Validate form
    const validate = await refVForm.value.validate();
    if (!validate.valid) return;

    // Extract token from URL
    const token = window.location.pathname.split("/").pop();
    // Prepare payload for API request
    const payload = {
      email: email.value,
      token: token,
      password: password.value,
      password_confirmation: confirmPassword.value,
    };

    // Make API request to reset password
    const response = await axios.post("/password/set", payload);
    // Show success toast
    toast("Password Reset Successfully", {
      theme: "auto",
      type: "success",
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      dangerouslyHTMLString: true,
    });
    // Redirect to login page after a delay
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    // Log error and show warning toast
    console.error("API call failed:", error);
    toast("Failed to Reset Password", {
      theme: "auto",
      type: "warning",
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      dangerouslyHTMLString: true,
    });
  }
};
</script>

<template>
  <!-- Main container -->
  <div>
    <!-- Row for layout -->
    <VRow no-gutters class="auth-wrapper bg-surface">
      <!-- Column for illustration -->
      <VCol lg="8" class="d-none d-lg-flex">
        <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
          <div class="d-flex align-center justify-center w-100 h-100">
            <!-- Illustration image -->
            <VImg
              max-width="505"
              :src="authThemeImg"
              class="auth-illustration mt-16 mb-2"
            />
          </div>

          <!-- Mask image -->
          <VImg :src="authThemeMask" class="auth-footer-mask" />
        </div>
      </VCol>

      <!-- Form Column -->
      <VCol
        cols="12"
        lg="4"
        class="auth-card-v2 d-flex align-center justify-center"
      >
        <!-- Card for form -->
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
          <VCardText>
            <!-- Title -->
            <h5 class="text-h5 mb-1">
              Welcome to
              <span class="text-capitalize"> Reset Your Password Page </span>!
              👋🏻
            </h5>
          </VCardText>

          <VCardText>
            <!-- Form -->
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
                    :type="confirmPasswordVisible ? 'text' : 'password'"
                    :rules="[
                      validationRules.confirmPassword,
                      validatePasswordMatch,
                    ]"
                    :append-inner-icon="
                      confirmPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    required
                    @click:append-inner="toggleConfirmPasswordVisibility"
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
