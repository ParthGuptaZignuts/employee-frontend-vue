<script setup>
import { avatarText } from "@/@core/utils/formatters";
import AddNewEmployeeDrawer from "../views/AddNewEmployeeDrawer.vue";
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
    title: "First Name",
    key: "first_name",
  },
  {
    title: "Last Name",
    key: "last_name",
  },
  {
    title: "Email",
    key: "email",
  },
  {
    title: "Type",
    key: "type",
  },
  {
    title: "Joining Date",
    key: "joining_date",
  },
  {
    title: "Employment Number",
    key: "employee_number",
  },
  {
    title: "Company Name",
    key: "company.name",
  },
  {
    title: "ACTIONS",
    key: "actions",
  },
];

const resolveStatusVariant = (status) => {
  if (status === "E") {
    return {
      color: "success",
      text: "Employee",
    };
  } else if (status === "CA") {
    return {
      color: "primary",
      text: "Company Admin",
    };
  } else {
    return {
      color: "info",
      text: "No status",
    };
  }
};

const openAddNewCompanyDrawer = async (employeeData) => {
  if (employeeData) {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/employee/${employeeData.id}`, config);
      editCompanyData.value = response.data.data;
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

const deleteItemConfirm = async () => {
  if (isSubmitEnabled.value) {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `/employee/${deleteItemId.value}`,
        { permanent_delete: permentDelete.value },
        config
      );

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
        `/employee/${editCompanyData.value.id}`,
        employeeData,
        config
      );
      console.log("Employee updated successfully:", response.data);
    } else {
      let response = await axios.post("employee/create", employeeData, config);
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
    const response = await axios.get("/employees", config);
    userList.value = response.data.data;
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
          Add New Employee
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
    <AddNewEmployeeDrawer
      v-model:isEmployeeDrawerOpen="isAddNewCompanyDrawerVisible"
      :employee-data="editCompanyData"
      @employee-data="handleNewUserData"
    />
  </div>
</template>
