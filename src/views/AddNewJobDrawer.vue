<script setup>
// Import necessary validators
import { requiredValidator, emailValidator } from "@validators";
import { defineProps, defineEmits, onMounted, ref, watch, nextTick } from "vue";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import axios from "../axiosFile";

// Define props and emits
const props = defineProps({
  isEmployeeDrawerOpen: {
    type: Boolean,
    required: true,
  },
  employeeData: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["update:isEmployeeDrawerOpen", "employeeData"]);

// Define reactive variables
const companyOptions = ref([]);
const isFormValid = ref(false);
const refForm = ref();
const Title = ref("");
const Salary = ref("");
const EmploymentStatus = ref("");
const ExperienceRequired = ref("");
const PostedOn = ref(null);
const ExpiresOn = ref(null);
const CompanyId = ref(null);

// Function to fetch company names from API
const fetchCompanyNames = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get("getallcompanies", config);
    companyOptions.value = response.data;
  } catch (error) {
    console.error("Error fetching company options:", error);
  }
};

// Function to handle model value update
const handleDrawerModelValueUpdate = (val) => {
  emit("update:isEmployeeDrawerOpen", val);
};

// Function to clear the form
const clearForm = () => {
  refForm.value?.reset();
  PostedOn.value = "";
  ExpiresOn.value = "";
  refForm.value?.resetValidation();
};

// Watch for changes in employeeData prop
watch(
  () => props.employeeData,
  (newValue) => {
    if (newValue) {
      Title.value = newValue.title;
      Salary.value = newValue.salary;
      EmploymentStatus.value = newValue.employment_type;
      ExperienceRequired.value = newValue.experience_required;
      PostedOn.value = newValue.posted_date;
      ExpiresOn.value = newValue.expiry_date;
      CompanyId.value = newValue.company_id;
    } else {
      CompanyId.value = null;
      clearForm();
    }
  }
);

// Function to handle form submission
const onSubmit = async () => {
  try {
    let validate = await refForm.value?.validate();
    if (validate.valid) {
      const formData = {
        title: Title.value,
        salary: Salary.value,
        employment_type: EmploymentStatus.value,
        experience_required: ExperienceRequired.value,
        posted_date: PostedOn.value,
        expiry_date: ExpiresOn.value,
        company_id: CompanyId.value,
      };
      emit("employeeData", formData);
    }
    closeNavigationDrawer();
    nextTick(() => {
      clearForm();
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Function to close the navigation drawer
const closeNavigationDrawer = () => {
  emit("update:isEmployeeDrawerOpen", false);
  clearForm();
};

// Fetch company names from API on component mount
onMounted(fetchCompanyNames);

</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isEmployeeDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- Title -->
    <AppDrawerHeaderSection
      :title="props.employeeData ? 'Edit Job' : 'Add Job'"
      @cancel="closeNavigationDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- Title -->
              <VCol cols="12">
                <AppTextField v-model="Title" :rules="[requiredValidator]" label="Title" />
              </VCol>

              <!-- Salary -->
              <VCol cols="12">
                <AppTextField v-model="Salary" type="number" label="Salary" />
              </VCol>

              <!-- Employment Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="EmploymentStatus"
                  :items="['Full time', 'Part time','Hybrid', 'Work from Home', 'Work From Office', 'Internship']"
                  label="Employment Status"
                  placeholder="Employment Status"
                />
              </VCol>

              <!-- Experience Required -->
              <VCol cols="12">
                <AppSelect
                  v-model="ExperienceRequired"
                  :items="['Low Level', 'Medium Level', 'High Level', ]"
                  label="Experience Required"
                  placeholder="Experience Required"
                />
              </VCol>

              <!-- Posted On -->
              <VCol cols="12">
                <AppDateTimePicker v-model="PostedOn" label="Posted On" placeholder="YYYY-MM-DD"/>
              </VCol>

              <!-- Expires On -->
              <VCol cols="12">
                <AppDateTimePicker v-model="ExpiresOn" label="Expires On" placeholder="YYY-MM-DD" />
              </VCol>

              <!-- Company -->
              <VCol cols="12">
                <AppAutocomplete
                  v-model="CompanyId"
                  label="Company"
                  :items="companyOptions"
                  item-title="name"
                  item-value="id"
                  :rules="[requiredValidator]"
                  :disabled="props.employeeData !== null"
                />
              </VCol>

              <!-- Submit and Cancel Buttons -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3">Submit</VBtn>
                <VBtn variant="tonal" color="secondary" @click="closeNavigationDrawer">Cancel</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
