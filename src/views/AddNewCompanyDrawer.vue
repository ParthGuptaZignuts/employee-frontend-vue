<script setup>
import { ref, defineProps, defineEmits, nextTick } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { emailValidator, requiredValidator } from '../@core/utils/validators'
import axios from '@/axiosFile.js'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const isFormValid = ref(false)
const refForm = ref()

const companyName = ref('')
const companyEmail = ref('')
const companyWebsite = ref('')
const companyLogo = ref('')
const companyAddress = ref('')
const companyStatus = ref('')

const adminFirstName = ref('')
const adminLastName = ref('')
const adminEmail = ref('')
const adminAddress = ref('')
const adminCity = ref('')
const adminDOB = ref(null)
const adminJoiningDate = ref(null)

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value.reset()
    refForm.value.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value.validate().then(({ valid }) => {
    if (valid) {
      const mappedStatus = companyStatus.value === 'Active' ? 'A' : 'I';
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
        logo: companyLogo.value
      }
      addNewUser(userData)
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

const handleFileUpload = (e) => {
  companyLogo.value = e.target.files[0];
};

const addNewUser = async (userData) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('website', userData.website);
    formData.append('address', userData.address);
    formData.append('status', userData.status);
    formData.append('admin[first_name]', userData.admin.first_name);
    formData.append('admin[last_name]', userData.admin.last_name);
    formData.append('admin[email]', userData.admin.email);
    formData.append('admin[address]', userData.admin.address);
    formData.append('admin[city]', userData.admin.city);
    formData.append('admin[dob]', userData.admin.dob);
    formData.append('admin[joining_date]', userData.admin.joining_date);
    if (userData.logo) {
      formData.append('logo', userData.logo);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post("/companies/create", formData, config);
    emit('userData', response.data);

    // Close the drawer
    closeNavigationDrawer();

  } catch (error) {
    console.error("Failed to create company:", error.message);
  }
};

</script>


<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Add Company" @cancel="closeNavigationDrawer" />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit" enctype="multipart/form-data">
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
                <Input
                type="file"
                  label="Upload logo"
                  prepend-icon="tabler-camera"
                  accept="image/*"
                  @change="handleFileUpload"
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
                />
              </VCol>

              <!-- 👉 Admin Joining Date -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="adminJoiningDate"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                  label="Admin Joining Date"
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
</template>
