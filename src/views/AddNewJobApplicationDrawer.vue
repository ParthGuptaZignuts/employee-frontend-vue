<script setup>
import { defineProps, defineEmits, ref, watch, nextTick } from "vue";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
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
const emit = defineEmits(["update:isEmployeeDrawerOpen", "formData"]);

// Define reactive variables
const isFormValid = ref(false);
const refForm = ref();
const CompanyId = ref(null);
const ApplicationNo = ref(null);
const NameOfCandidate = ref("");
const NameOfCompany = ref("");
const PostAppliedFor = ref("");
const Status = ref("P"); // Default to Pending (shortened form)

// Define a mapping for display and internal status values
const statusMap = {
  P: "Pending",
  A: "Approved",
  R: "Rejected",
};

// Computed property to get and set the display value for status
const displayStatus = computed({
  get() {
    return statusMap[Status.value];
  },
  set(newStatus) {
    Status.value = Object.keys(statusMap).find(key => statusMap[key] === newStatus);
  },
});

// Function to handle model value update
const handleDrawerModelValueUpdate = (val) => {
  emit("update:isEmployeeDrawerOpen", val);
};

// Function to clear the form
const clearForm = () => {
  refForm.value?.reset();
  refForm.value?.resetValidation();
};

// Watch for changes in employeeData prop
watch(
  () => props.employeeData,
  (newValue) => {
    if (newValue) {
      ApplicationNo.value = newValue.application_id;
      NameOfCandidate.value = newValue.candidate_name;
      NameOfCompany.value = newValue.company_name;
      PostAppliedFor.value = newValue.job_title;
      Status.value = newValue.status; // Assign the internal status value directly
    } else {
      CompanyId.value = null;
      clearForm();
    }
  }
);

const onSubmit = async () => {
  try {
    let validate = await refForm.value?.validate();
    if (validate.valid) {
      // All validations passed, proceed with form submission
      const formData = {
        application_id: ApplicationNo.value,
        status: Status.value, // Use the internal status value
      };
      emit("formData", formData);
      closeNavigationDrawer();
      nextTick(() => {
        clearForm();
      });
    } else {
      // Form is invalid, display a message indicating required fields
      toast("Please fill in all required fields", {
        theme: "auto",
        type: "error",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Function to close the navigation drawer
const closeNavigationDrawer = () => {
  emit("update:isEmployeeDrawerOpen", false);
  clearForm();
};

</script>

<template>
  <div>
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
        title="EDIT JOB APPLICATION"
        @cancel="closeNavigationDrawer"
      />

      <PerfectScrollbar :options="{ wheelPropagation: false }">
        <VCard flat>
          <VCardText>
            <VForm
              ref="refForm"
              v-model="isFormValid"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- Application No -->
                <VCol cols="12">
                  <AppTextField
                    v-model="ApplicationNo"
                    label="Application No"
                    disabled
                  />
                </VCol>

                <!-- Name of Candidate -->
                <VCol cols="12">
                  <AppTextField
                    v-model="NameOfCandidate"
                    label="Name of Candidate"
                    disabled
                  />
                </VCol>

                <!-- Name of Company -->
                <VCol cols="12">
                  <AppTextField
                    v-model="NameOfCompany"
                    label="Name of Company"
                    disabled
                  />
                </VCol>

                <!-- Post Applied For -->
                <VCol cols="12">
                  <AppTextField
                    v-model="PostAppliedFor"
                    label="Post Applied For"
                    disabled
                  />
                </VCol>

              <!-- Candidate Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="displayStatus"
                  :items="['Pending', 'Approved', 'Rejected']"
                  label="Status"
                  placeholder="Select a Status"
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
  </div>
</template>

<style scoped>
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
