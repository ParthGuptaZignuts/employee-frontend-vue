<script setup>
// Import necessary validators
import { ref, defineProps, defineEmits, nextTick, watch } from "vue";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import { emailValidator, requiredValidator } from "../@core/utils/validators";
import axios from "@/axiosFile.js";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// Define props and emits
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  companyData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:isDrawerOpen", "userData"]);

// Define reactive variables
const isFormValid = ref(false);
const refForm = ref();
const companyName = ref("");
const companyEmail = ref("");
const companyWebsite = ref("");
const companyLogo = ref(null);
const companyAddress = ref("");
const companyStatus = ref("");

const adminFirstName = ref("");
const adminLastName = ref("");
const adminEmail = ref("");
const adminAddress = ref("");
const adminCity = ref("");
const adminDOB = ref(null);
const adminJoiningDate = ref(null);
const mode = ref("add");

// function called the navigation drawer is closed
const closeNavigationDrawer = () => {
  emit("update:isDrawerOpen", false);
  refForm.value.reset();
  resetFormValidation(); // Reset form validation state
  resetFormFields(); // Reset form fields
  companyLogo.value = "";
  nextTick(() => {
    refForm.value.reset();
    resetFormValidation(); // Reset form validation state
    resetFormFields();
  });
};

// function to reset form value
const resetFormFields = () => {
  companyName.value = "";
  companyEmail.value = "";
  companyWebsite.value = "";
  companyLogo.value = "";
  companyAddress.value = "";
  companyStatus.value = "";
  adminFirstName.value = "";
  adminLastName.value = "";
  adminEmail.value = "";
  adminAddress.value = "";
  adminCity.value = "";
  adminDOB.value = null;
  adminJoiningDate.value = null;
};

// function to reset form validation
const resetFormValidation = () => {
  isFormValid.value = true; // Reset validation state to true
  if (refForm.value) {
    refForm.value.resetValidation();
  }
};

// function to check mode whether add or edit mode
const switchMode = (newMode) => {
  mode.value = newMode;
  if (newMode === "add") {
    resetFormFields();
    nextTick(() => {
      resetFormValidation(); // Reset form validation state
    });
  } else {
    companyName.value = props.companyData.name || "";
    companyEmail.value = props.companyData.email || "";
    companyWebsite.value = props.companyData.website || "";
    companyAddress.value = props.companyData.address || "";
    companyStatus.value =
      props.companyData.status === "A" ? "Active" : "Inactive";
    adminFirstName.value = props.companyData.admin?.first_name || "";
    adminLastName.value = props.companyData.admin?.last_name || "";
    adminEmail.value = props.companyData.admin?.email || "";
    adminAddress.value = props.companyData.admin?.address || "";
    adminCity.value = props.companyData.admin?.city || "";
    adminDOB.value = props.companyData.admin?.dob || null;
    adminJoiningDate.value = props.companyData.admin?.joining_date || null;
  }
};

// on submit form
const onSubmit = () => {
  refForm.value.validate().then(({ valid }) => {
    if (valid) {
      if (new Date(adminJoiningDate.value) < new Date(adminDOB.value)) {
        toast("Joining Date cannot be before Date of Birth", {
          theme: "auto",
          type: "error",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        return;
      }
      const mappedStatus = companyStatus.value === "Active" ? "A" : "I";
      const userData = {
        name: companyName.value,
        email: companyEmail.value,
        website: companyWebsite.value,
        address: companyAddress.value,
        status: mappedStatus,
        admin: {
          first_name: adminFirstName.value,
          last_name: adminLastName.value,
          email: adminEmail.value,
          address: adminAddress.value,
          city: adminCity.value,
          dob: adminDOB.value,
          joining_date: adminJoiningDate.value,
        },
        logo: companyLogo.value[0],
      };
      if (props.companyData) {
        editUser(userData);
      } else {
        addNewUser(userData);
      }
      closeNavigationDrawer();
      setTimeout(() => {
        nextTick(() => {
          resetFormFields();
          resetFormValidation();
        });
      }, 500);
    }
  });
};

// drawer model value updation
const handleDrawerModelValueUpdate = (val) => {
  emit("update:isDrawerOpen", val);
};

// function when new user is added
const addNewUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("website", userData.website);
    formData.append("address", userData.address);
    formData.append("status", userData.status);
    formData.append("admin[first_name]", userData.admin.first_name);
    formData.append("admin[last_name]", userData.admin.last_name);
    formData.append("admin[email]", userData.admin.email);
    formData.append("admin[address]", userData.admin.address);
    formData.append("admin[city]", userData.admin.city);
    formData.append("admin[dob]", userData.admin.dob);
    formData.append("admin[joining_date]", userData.admin.joining_date);
    formData.append("logo", userData.logo);
    const response = await axios.post("/companies/create", formData);
    emit("userData", response.data);
    closeNavigationDrawer();
  } catch (error) {
    console.error("Failed to create company:", error.message);
  }
};

// function for edit user
const editUser = async (userData) => {
  try {
    const company_id = props.companyData.id;
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("website", userData.website);
    formData.append("address", userData.address);
    formData.append("status", userData.status);
    formData.append("admin[first_name]", userData.admin.first_name);
    formData.append("admin[last_name]", userData.admin.last_name);
    formData.append("admin[email]", userData.admin.email);
    formData.append("admin[address]", userData.admin.address);
    formData.append("admin[city]", userData.admin.city);
    formData.append("admin[dob]", userData.admin.dob);
    formData.append("admin[joining_date]", userData.admin.joining_date);
    if (userData.logo) {
      formData.append("logo", userData.logo);
    }

    const response = await axios.post(`/companies/${company_id}`, formData);
    emit("userData", response.data);

    closeNavigationDrawer();
  } catch (error) {
    console.error("Failed to update company:", error.message);
  }
};

if (props.companyData) {
  const { name, email, website, address, status, admin, logo } =
    props.companyData;
  companyName.value = name;
  companyEmail.value = email;
  companyWebsite.value = website;
  companyAddress.value = address;
  companyStatus.value = status === "Active" ? "Active" : "Inactive";
  adminFirstName.value = admin.first_name;
  adminLastName.value = admin.last_name;
  adminEmail.value = admin.email;
  adminAddress.value = admin.address;
  adminCity.value = admin.city;
  adminDOB.value = admin.dob;
  adminJoiningDate.value = admin.joining_date;
  mode.value = "edit";
}

// watcher to put value into drawer
watch(
  () => props.companyData,
  (newValue, oldValue) => {
    if (newValue !== null) {
      const { name, email, website, address, status, admin, logo } = newValue;
      companyName.value = name;
      companyEmail.value = email;
      companyWebsite.value = website;
      companyAddress.value = address;
      companyStatus.value = status === "Active" ? "Active" : "Inactive";
      adminFirstName.value = admin.first_name;
      adminLastName.value = admin.last_name;
      adminEmail.value = admin.email;
      adminAddress.value = admin.address;
      adminCity.value = admin.city;
      adminDOB.value = admin.dob;
      adminJoiningDate.value = admin.joining_date;
      switchMode("edit");
    } else {
      switchMode("add");
    }
  },
  { immediate: true }
);
</script>

<!-- template section -->
<template>
  <div>
    <VNavigationDrawer
      temporary
      :width="400"
      location="end"
      class="scrollable-content"
      :model-value="props.isDrawerOpen"
      @update:model-value="handleDrawerModelValueUpdate"
    >
      <!-- 👉 Title -->
      <AppDrawerHeaderSection
        :title="mode === 'add' ? 'Add Company' : 'Edit Company'"
        @cancel="closeNavigationDrawer"
      />

      <PerfectScrollbar :options="{ wheelPropagation: false }">
        <VCard flat>
          <VCardText>
            <!-- 👉 Form -->
            <VForm
              ref="refForm"
              v-model="isFormValid"
              enctype="multipart/form-data"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- 👉 Company Name -->
                <VCol cols="12">
                  <AppTextField
                    v-model="companyName"
                    :rules="[requiredValidator]"
                    label="Company Name"
                  />
                </VCol>

                <!-- 👉 Company Email -->
                <VCol cols="12">
                  <AppTextField
                    v-model="companyEmail"
                    :rules="[requiredValidator, emailValidator]"
                    label="Company Email"
                  />
                </VCol>

                <!-- 👉 Company Website -->
                <VCol cols="12">
                  <AppTextField
                    v-model="companyWebsite"
                    :rules="[requiredValidator]"
                    label="Company Website"
                  />
                </VCol>

                <!-- 👉 Company Logo -->
                <VCol cols="12">
                  <VFileInput
                    v-model="companyLogo"
                    type="file"
                    label="Upload logo"
                    prepend-icon="tabler-camera"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                  />
                </VCol>

                <!-- 👉 Company Address -->
                <VCol cols="12">
                  <AppTextField
                    v-model="companyAddress"
                    :rules="[requiredValidator]"
                    label="Company Address"
                  />
                </VCol>

                <!-- 👉 Company Status -->
                <VCol cols="12">
                  <AppSelect
                    v-model="companyStatus"
                    label="Company Status"
                    :rules="[requiredValidator]"
                    :items="['Active', 'Inactive']"
                  />
                </VCol>

                <!-- 👉 Admin First Name -->
                <VCol cols="12">
                  <AppTextField
                    v-model="adminFirstName"
                    :rules="[requiredValidator]"
                    label="Admin First Name"
                  />
                </VCol>

                <!-- 👉 Admin Last Name -->
                <VCol cols="12">
                  <AppTextField
                    v-model="adminLastName"
                    :rules="[requiredValidator]"
                    label="Admin Last Name"
                  />
                </VCol>

                <!-- 👉 Admin Email -->
                <VCol cols="12">
                  <AppTextField
                    v-model="adminEmail"
                    :rules="[requiredValidator, emailValidator]"
                    label="Admin Email"
                  />
                </VCol>

                <!-- 👉 Admin Address -->
                <VCol cols="12">
                  <AppTextField
                    v-model="adminAddress"
                    :rules="[requiredValidator]"
                    label="Admin Address"
                  />
                </VCol>

                <!-- 👉 Admin City -->
                <VCol cols="12">
                  <AppTextField
                    v-model="adminCity"
                    :rules="[requiredValidator]"
                    label="Admin City"
                  />
                </VCol>

                <!-- 👉 Admin Date of Birth -->
                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="adminDOB"
                    placeholder="YYYY-MM-DD"
                    :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                    label="Date of Birth"
                    :rules="[(v) => !!v || 'Date is required']"
                  />
                </VCol>

                <!-- 👉 Admin Joining Date -->
                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="adminJoiningDate"
                    placeholder="YYYY-MM-DD"
                    label="Admin Joining Date"
                    :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                    :rules="[(x) => !!x || 'Date is required']"
                  />
                </VCol>
                <VDivider />
                <!-- 👉 Submit and Cancel -->
                <VCol cols="12">
                  <VBtn type="submit" class="me-3"> Submit </VBtn>
                  <VBtn
                    type="reset"
                    variant="tonal"
                    color="secondary"
                    @click="closeNavigationDrawer"
                  >
                    Cancel
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </PerfectScrollbar>
    </VNavigationDrawer>
  </div>
</template>
