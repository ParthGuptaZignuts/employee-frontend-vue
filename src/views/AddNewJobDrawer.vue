<script setup>
// Import necessary validators
import { requiredValidator, emailValidator } from "@validators";
import { defineProps, defineEmits, onMounted, ref, watch, nextTick } from "vue";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import axios from "../axiosFile";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

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
const skillsRequired = ref([]);

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
  skillsRequired.value = [];
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
      skillsRequired.value = newValue.skills_required
        ? newValue.skills_required.split(",").map((skill) => skill.trim())
        : [];
    } else {
      CompanyId.value = null;
      clearForm();
    }
  }
);
watch(
  () => skillsRequired.value,
  (newValue) => {
    if (newValue.includes("No Specific Skills Required") && newValue.length > 1) {
      skillsRequired.value = newValue.filter(skill => skill !== "No Specific Skills Required");
    }
  }
);
const skillsOptions = [
  { label: "MERN", value: "MERN" },
  { label: "MEAN", value: "MEAN" },
  { label: "LARAVEL+VUE", value: "LARAVEL+VUE" },
  { label: "FLUTTER", value: "FLUTTER" },
  { label: "DEVOPS", value: "DEVOPS" },
  { label: "UI / UX", value: "UI / UX" },
  { label: "ANDROID", value: "ANDROID" },
  { label: "SALESFORCE", value: "SALESFORCE" },
  { label: "REACT.JS", value: "REACT.JS" },
  { label: "NODE.JS", value: "NODE.JS" },
  { label: "AWS", value: "AWS" },
  { label: "DBA", value: "DBA" },
  {
    label: "No Specific Skills Required",
    value: "No Specific Skills Required",
  },
];

// Function to handle form submission
const onSubmit = async () => {
  try {
    let validate = await refForm.value?.validate();
    if (validate.valid) {
      if (new Date(ExpiresOn.value) < new Date(PostedOn.value)) {
        toast("Joining Date cannot be before Date of Birth", {
          theme: "auto",
          type: "error",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        return;
      }
      if (Salary.value > 1000000) {
        toast("Enter the Valid value for Salary", {
          theme: "auto",
          type: "error",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        return;
      }
      if (skillsRequired.value.length === 0) {
        toast("Please select at least one skill", {
          theme: "auto",
          type: "error",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
        return;
      }
      const formData = {
        title: Title.value,
        salary: Salary.value,
        employment_type: EmploymentStatus.value,
        experience_required: ExperienceRequired.value,
        posted_date: PostedOn.value,
        expiry_date: ExpiresOn.value,
        company_id: CompanyId.value,
        skills_required: skillsRequired.value.join(", "),
      };
      console.log(formData);
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
                <AppTextField
                  v-model="Title"
                  :rules="[requiredValidator]"
                  label="Title"
                />
              </VCol>

              <!-- Salary -->
              <VCol cols="12">
                <AppTextField
                  v-model="Salary"
                  type="number"
                  label="Salary"
                  placeholder="Salary Valid Upto 1000000"
                />
              </VCol>

              <!-- Employment Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="EmploymentStatus"
                  :items="[
                    'Full time',
                    'Part time',
                    'Hybrid',
                    'Work from Home',
                    'Work From Office',
                    'Internship',
                  ]"
                  label="Employment Status"
                  placeholder="Employment Status"
                />
              </VCol>

              <!-- Experience Required -->
              <VCol cols="12">
                <AppSelect
                  v-model="ExperienceRequired"
                  :items="[
                    'Low Level (0 to 1 Yrs) ',
                    'Medium Level (2 TO 5 Yrs)',
                    'High Level (5+ Yrs)',
                  ]"
                  label="Experience Required"
                  placeholder="Experience Required"
                />
              </VCol>

              <!-- skills required -->
              <VCol cols="12">
                <label for="skillsRequired" class="skills-margin"
                  >Skills Required</label
                >
                <div id="skillsRequired" class="skills-grid">
                  <!-- List of checkboxes for skills -->
                  <div
                    v-for="skill in skillsOptions"
                    :key="skill.value"
                    class="skills-checkbox"
                  >
                    <VCheckbox
                      v-model="skillsRequired"
                      :value="skill.value"
                      :label="skill.label"
                      :id="skill.value"
                    ></VCheckbox>
                  </div>
                </div>
              </VCol>

              <!-- Posted On -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="PostedOn"
                  label="Posted On"
                  placeholder="YYYY-MM-DD"
                />
              </VCol>

              <!-- Expires On -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="ExpiresOn"
                  label="Expires On"
                  placeholder="YYY-MM-DD"
                />
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
                <VBtn
                  variant="tonal"
                  color="secondary"
                  @click="closeNavigationDrawer"
                  >Cancel</VBtn
                >
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.skills-checkbox {
  display: flex;
  align-items: center;
}

.skills-checkbox input {
  margin-right: 5px;
}

.skills-margin {
  margin-bottom: 10px;
}
</style>
