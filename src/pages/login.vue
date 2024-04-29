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
import axios from "../axiosFile";
import { validationRules } from "../composables/useValidation.js";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// Generating image variants based on the theme
const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

// Reactive variables and references
const isPasswordVisible = ref(false);
const refVForm = ref();
const email = ref("");
const password = ref("");
const router = useRouter(); 

// Handle form submission
const handleSubmit = async () => {
  try {
    // Validate form fields
    const validate = await refVForm.value.validate();

    if (!validate.valid) return; // If validation fails, do nothing

    // Prepare payload for API request
    const payload = {
      email: email.value,
      password: password.value,
    };

    // Make API call to login endpoint
    const response = await axios.post("/login", payload);

    // Handle response based on user type
    if (response.data.data.user) {
      if (response.data.data.user.type === "SA") {
        // If super admin, set token and type in local storage, show success message, and redirect
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("type", "SA");
        toast("Super Admin login Successful", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        setTimeout(function () {
          router.push("/");
        }, 2000);
      } else if (response.data.data.user.type === "CA") {
        // If company admin, set token and type in local storage, show success message, and redirect
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("type", "CA");
        toast("Company Admin login Successful", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        // after 2seconds pushing it to dashboard
        setTimeout(function () {
          router.push("/");
        }, 2000);
      }
    } else {
      // If user data not found, show warning message
      toast("User data not found", {
        theme: "auto",
        type: "warning",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    }
  } catch (error) {
    // If API call fails, show error message
    toast("API call failed:", error, {
      theme: "auto",
      type: "warning",
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      dangerouslyHTMLString: true,
    });
  }
};
</script>

<!-- template section -->
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
            <!-- welcome section -->
            <h5 class="text-h5 mb-1">
              Welcome to
              <span class="text-capitalize"> Employee Management System </span>!
              👋🏻
            </h5>

            <p class="mb-0">
              Please sign-in to your account and start the adventure
            </p>
          </VCardText>

          <VCardText>
            <VForm ref="refVForm" @submit.prevent="handleSubmit">
              <VRow>
                <!-- email field -->
                <VCol cols="12">
                  <AppTextField
                    v-model="email"
                    :rules="validationRules.email"
                    label="Email"
                    type="email"     
                    autofocus
                    required
                  />
                </VCol>

                <!-- password field -->
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
