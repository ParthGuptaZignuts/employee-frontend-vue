<script setup>
import { avatarText } from "@/@core/utils/formatters";
import AddNewJobDrawer from "../views/AddNewJobDrawer.vue";
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { computed } from "vue";

const deleteDialog = ref(false);
const isAddNewCompanyDrawerVisible = ref(false);
const editCompanyData = ref(null);
const isEditMode = ref(false);
const deleteItemId = ref(null);
const userList = ref([]);
const permentDelete = ref(false);
const tempDelete = ref(false);
const loading = ref(false);

// headers
const headers = [
  {
    title: "Title",
    key: "title",
  },
  {
    title: "Salary",
    key: "salary",
  },
  {
    title: "Employment Status",
    key: "employment_type",
  },
  {
    title: "Experience Required",
    key: "experience_required",
  },
  {
    title: "Posted On",
    key: "posted_date",
  },
  {
    title: "Expires On",
    key: "expiry_date",
  },
  {
    title: "Company Name",
    key: "company.name",
  },
  {
    title: "Actions",
    key: "actions",
  },
];

const openAddNewCompanyDrawer = async (employeeData) => {
  console.log(employeeData);
  if (employeeData) {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/job/${employeeData.id}`, config);
      editCompanyData.value = response.data;
      console.log(editCompanyData.value);
      if (editCompanyData.value) {
        isEditMode.value = true;
        isAddNewCompanyDrawerVisible.value = true;
      }
    } catch (error) {
      console.error("Failed to fetch employee details:", error.message);
    }
  } else {
    editCompanyData.value = null;
    isEditMode.value = false;
    isAddNewCompanyDrawerVisible.value = true;
  }
};

const deleteItem = (item) => {
  deleteItemId.value = item;
  deleteDialog.value = true;
};

const closeDelete = () => {
  deleteDialog.value = false;
  permentDelete.value = false;
  tempDelete.value = false;
};

const isSubmitEnabled = computed(() => permentDelete.value || tempDelete.value);


// const deleteItemConfirm = async () => {
//   if (isSubmitEnabled.value) {
//     try {
//       const token = localStorage.getItem("token");
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };

//       const params = {
//         permanent_delete: permentDelete.value,
//       };
//       await axios.post(`/job/delete/${deleteItemId.value}`, {
//         ...config,
//         params,
//       });

//       userList.value = userList.value.filter(
//         (employee) => employee.id !== deleteItemId.value
//       );

//       closeDelete();
//     } catch (error) {
//       console.error("Failed to delete employee:", error.message);
//     }
//   }
// };

const deleteItemConfirm = async () => {
  if (isSubmitEnabled.value) {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const params = {
        permanent_delete: permentDelete.value,
      };

      // Update the delete request to include the token in the headers
      await axios.post(`/job/delete/${deleteItemId.value}`, null, {
        ...config,
        params,
      });

      userList.value = userList.value.filter(
        (employee) => employee.id !== deleteItemId.value
      );

      closeDelete();
    } catch (error) {
      console.error("Failed to delete employee:", error.message);
    }
  }
};

const handleNewUserData = async (employeeData) => {
  try {
    loading.value = true;

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log(isEditMode.value);
    if (isEditMode.value) {
      let response = await axios.post(
        `/job/update/${editCompanyData.value.id}`,
        employeeData,
        config
      );
      console.log("Employee updated successfully:", response.data);
    } else {
      let response = await axios.post("job/create", employeeData, config);
      console.log("Employee created successfully:", response.data);
    }

    fetchData();

    isAddNewCompanyDrawerVisible.value = false;
    loading.value = false;
  } catch (error) {
    console.error("Failed to update or create Employee:", error.message);
    loading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get("/jobs", config);
    userList.value = response.data;
    console.log(userList.value);
  } catch (error) {
    console.error("Failed to fetch company data:", error.message);
  }
  loading.value = false;
};

const handleDeleteOptionChange = (option) => {
  if (option === "permanent") {
    tempDelete.value = false;
  } else if (option === "temporary") {
    permentDelete.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div v-if="loading" class="d-flex justify-center">
      <VProgressCircular :size="40" color="primary" indeterminate />
    </div>
    <div v-else>
      <div class="d-flex justify-end ma-3">
        <VBtn prepend-icon="tabler-plus" @click="openAddNewCompanyDrawer(null)">
          Create New Job
        </VBtn>
      </div>
      <VDataTable :headers="headers" :items="userList" :items-per-page="10">
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              :color="item.raw.avatar ? '' : 'primary'"
              :class="item.raw.avatar ? '' : 'v-avatar-light-bg primary--text'"
              :variant="!item.raw.avatar ? 'tonal' : undefined"
            >
              <VImg
                v-if="item.raw.logo"
                :src="`http://127.0.0.1:8000/storage/logos/${item.raw.logo}`"
              />
              <span v-else>{{ avatarText(item.raw.name) }}</span>
            </VAvatar>

            <div class="d-flex flex-column ms-3">
              <span
                class="d-block font-weight-medium text--primary text-truncate"
                >{{ item.raw.name }}</span
              >
            </div>
          </div>
        </template>

        <template #item.company_email="{ item }">
          <span>{{ item.raw.company_email }}</span>
        </template>

        <template #item.website="{ item }">
          <a :href="item.raw.website" target="_blank" rel="noopener noreferrer"
            ><span>{{ item.raw.name }}</span></a
          >
        </template>

        <template #item.type="{ item }">
          <VChip
            :color="resolveStatusVariant(item.raw.type).color"
            size="small"
            label
            class="text-capitalize"
          >
            <span>{{ resolveStatusVariant(item.raw.type).text }}</span>
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn @click="openAddNewCompanyDrawer(item.raw)">
              <VIcon icon="mdi-pencil-outline" />
            </IconBtn>
            <IconBtn @click="deleteItem(item.raw.id)">
              <VIcon icon="mdi-delete-outline" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </div>
    <VDialog v-model="deleteDialog" max-width="500px">
      <VCard>
        <VCardTitle class="text-center d-flex align-center justify-center mb-3">
          Are you sure you want to delete this item?
        </VCardTitle>
        <div class="text-center d-flex align-center justify-center mb-5">
          <VCheckbox
            v-model="permentDelete"
            label="DELETE ITEM PERMANENTLY"
            name="del"
            @change="handleDeleteOptionChange('permanent')"
          />
        </div>
        <div class="text-center d-flex align-center justify-center mb-5">
          <VCheckbox
            v-model="tempDelete"
            label="DELETE ITEM TEMPORARILY"
            name="del"
            @change="handleDeleteOptionChange('temporary')"
          />
        </div>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="closeDelete">
            Cancel
          </VBtn>
          <VBtn
            color="success"
            variant="elevated"
            @click="deleteItemConfirm"
            :disabled="!isSubmitEnabled"
          >
            OK
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>
    <AddNewJobDrawer
      v-model:isEmployeeDrawerOpen="isAddNewCompanyDrawerVisible"
      :employee-data="editCompanyData"
      @employee-data="handleNewUserData"
    />
  </div>
</template>
