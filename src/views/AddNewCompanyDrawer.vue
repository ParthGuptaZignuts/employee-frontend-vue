<script setup>
import { defineProps, nextTick, ref } from "vue"
import { PerfectScrollbar } from "vue3-perfect-scrollbar"

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  companyData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(["update:isDrawerOpen", "userData"])
const statusOptions = ["Active", "Inactive"]
const isFormValid = ref(false)
const refForm = ref()

const CompanyName = ref("")
const CompanyEmail = ref("")
const Website = ref("https://")
const LogoUrl = ref(null)
const Location = ref("")
const Status = ref("Active")
const AdminFirstName = ref("")
const AdminLastName = ref("")
const AdminEmail = ref("")
const Address = ref("")
const City = ref("")
const DOB = ref("")
const AdminJoiningDate = ref("")
const EmployeeNumber = ref("")

const clearForm = () => {
  // Reset all form data

  refForm.value?.reset()
  Website.value = "https://"
  Status.value = "Active"
  DOB.value = ""
  AdminJoiningDate.value = ""
  LogoUrl.value = null
  refForm.value?.resetValidation()
}

const closeNavigationDrawer = () => {
  emit("update:isDrawerOpen", false)
  refForm.value?.resetValidation()
  nextTick(clearForm)
}

watch(
  () => props.companyData,
  newValue => {
    if (newValue) {
      CompanyName.value = newValue.name
      CompanyEmail.value = newValue.company_email
      Website.value = newValue.website
      Location.value = newValue.location
      Status.value = newValue.status === "A" ? "Active" : "Inactive"
      AdminFirstName.value = newValue.company_admin.first_name
      AdminLastName.value = newValue.company_admin.last_name

      AdminEmail.value = newValue.company_admin.email
      Address.value = newValue.company_admin.address
      City.value = newValue.company_admin.city
      DOB.value = newValue.company_admin.dob
      AdminJoiningDate.value = newValue.company_admin.joining_date
      EmployeeNumber.value = newValue.company_admin.emp_no
    } else {
      refForm.value?.resetValidation()
      clearForm()
    }
  },
)

const onSubmit = async () => {
  console.log("hii")
  try {
    let validation = await refForm.value?.validate()
    console.log(validation)
    if (validation.valid) {
      const formData = new FormData()
      if (LogoUrl.value && LogoUrl.value[0]) {
        formData.append("logo", LogoUrl.value[0])
      }

      formData.append("name", CompanyName.value)
      formData.append("company_email", CompanyEmail.value)
      formData.append("website", Website.value)
      formData.append("location", Location.value)
      formData.append("status", Status.value === "Active" ? "A" : "I")
      formData.append("admin[first_name]", AdminFirstName.value)
      formData.append("admin[last_name]", AdminLastName.value)
      formData.append("admin[address]", Address.value)
      formData.append("admin[city]", City.value)
      formData.append("admin[dob]", DOB.value)
      formData.append("admin[joining_date]", AdminJoiningDate.value)
      formData.append("admin[emp_no]", EmployeeNumber.value)

      // Include AdminEmail for new companies
      if (!props.companyData) {
        formData.append("admin[email]", AdminEmail.value)
      }

      // Emit userData event with form data
      emit("userData", formData)

      // Reset form validation
      refForm.value?.resetValidation()

      // Close navigation drawer
      closeNavigationDrawer()

      // Reset form after submission (consider using a separate reset function)
      nextTick(() => {
        clearForm()
      })
    }
  } catch (error) {
    console.error("Error during form validation:", error)
  }
}


const handleDrawerModelValueUpdate = val => {
  emit("update:isDrawerOpen", val)
}
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
    <AppDrawerHeaderSection
      :title="props.companyData ? 'Edit Company' : 'Add Company'"
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="CompanyName"
                  :rules="[requiredValidator]"
                  label="Company Name"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="CompanyEmail"
                  :rules="[requiredValidator, emailValidator]"
                  label="Company Email"
                />
              </VCol>

              <!-- 👉 Website -->
              <VCol cols="12">
                <AppTextField
                  v-model="Website"
                  :rules="[requiredValidator, urlValidator]"
                  label="Website"
                />
              </VCol>
              <!-- 👉 Logo URL -->
              <VCol cols="12">
                <VFileInput
                  v-model="LogoUrl"
                  label="Upload logo"
                  prepend-icon="tabler-camera"
                />
              </VCol>
              <!-- 👉 Location -->
              <VCol cols="12">
                <AppTextField
                  v-model="Location"
                  label="Location"
                />
              </VCol>
              <VCol cols="12">
                <VSelect
                  v-model="Status"
                  :items="statusOptions"
                  :rules="[requiredValidator]"
                  label="Status"
                />
              </VCol>

              <VDivider />
              <!-- 👉 Admin First Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="AdminFirstName"
                  :rules="[requiredValidator]"
                  label="Admin First Name"
                />
              </VCol>
              <!-- 👉 Admin Last Name -->
              <VCol cols="12">
                <AppTextField
                  v-model="AdminLastName"
                  :rules="[requiredValidator]"
                  label="Admin Last Name"
                />
              </VCol>
              <!-- 👉 Admin Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="AdminEmail"
                  label="Admin Email"
                  :rules="[requiredValidator, emailValidator]"
                  :disabled="props.companyData !== null"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="Address"
                  :rules="[requiredValidator]"
                  label="Address"
                />
              </VCol>
              <!-- 👉 City -->
              <VCol cols="12">
                <AppTextField
                  v-model="City"
                  :rules="[requiredValidator]"
                  label="City"
                />
              </VCol>
              <!-- 👉 Date of Birth -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="DOB"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                  label="
                  date
                  of
                  Birth"
                />
              </VCol>
              <VDivider />
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="AdminJoiningDate"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                  label="Admin Joining Date"
                />
              </VCol>
              <!-- 👉 Employee Number -->
              <VCol
                v-if="props.companyData !== null"
                cols="12"
              >
                <AppTextField
                  v-model="EmployeeNumber"
                  label="Employee Number"
                  disabled
                />
              </VCol>
              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
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