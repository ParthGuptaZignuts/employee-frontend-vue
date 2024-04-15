<script setup>
import { emailValidator, requiredValidator } from "@validators";
import { defineProps, defineEmits, onMounted, ref, watch, nextTick } from "vue";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import axios from "../axiosFile";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

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
const companyOptions = ref([]);
const isFormValid = ref(false);
const refForm = ref();
const FirstName = ref("");
const LastName = ref("");
const Email = ref("");
const Address = ref("");
const City = ref("");
const DOB = ref(null);
const JoiningDate = ref(null);
const CompanyId = ref(null);

const fetchCompanyNames = async () => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get("getallcompanies", config);

    companyOptions.value = response.data;
  } catch (error) {
    console.error("Error fetching company options:", error);
  }
};

const handleDrawerModelValueUpdate = (val) => {
  emit("update:isEmployeeDrawerOpen", val);
};

const clearForm = () => {
  refForm.value?.reset();
  DOB.value = "";
  JoiningDate.value = "";
  refForm.value?.resetValidation();
};

const closeNavigationDrawer = () => {
  emit("update:isEmployeeDrawerOpen", false);
  clearForm();
};

watch(
  () => props.employeeData,
  (newValue) => {
    if (newValue) {
      FirstName.value = newValue.first_name;
      LastName.value = newValue.last_name;
      Email.value = newValue.email;
      Address.value = newValue.address;
      City.value = newValue.city;
      DOB.value = newValue.dob;
      JoiningDate.value = newValue.joining_date;
      CompanyId.value = newValue.company_id;
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
      if (new Date(JoiningDate.value) < new Date(DOB.value)) {
        toast("Joining Date cannot be before Date of Birth", {
        theme: "auto",
        type: "error",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
        return;
      }
      const formData = {
        first_name: FirstName.value,
        last_name: LastName.value,
        email: Email.value,
        address: Address.value,
        city: City.value,
        dob: DOB.value,
        joining_date: JoiningDate.value,
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
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="props.employeeData ? 'Edit Employee' : 'Add Employee'"
      @cancel="closeNavigationDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="FirstName"
                  :rules="[requiredValidator]"
                  label="First Name"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="LastName"
                  :rules="[requiredValidator]"
                  label="Last Name"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="Email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
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
                  label="Date of Birth"
                />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker
                  v-model="JoiningDate"
                  placeholder="YYYY-MM-DD"
                  :config="{ dateFormat: 'Y-m-d', maxDate: new Date() }"
                  label="Joining Date"
                />
              </VCol>

              <!-- 👉 Company -->
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

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3">Submit</VBtn>
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
