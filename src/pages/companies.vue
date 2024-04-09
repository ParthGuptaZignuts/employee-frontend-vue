<script setup>
import { avatarText } from "@/@core/utils/formatters";
import AddNewCompanyDrawer from '@/views/AddNewCompanyDrawer.vue'
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";

const deleteDialog = ref(false);
const isAddNewCompanyDrawerVisible = ref(false)
const editCompanyData = ref(null);
const isEditMode = ref(false);
const deleteItemId = ref(null);
const userList = ref([]);
const permentDelete = ref(false);
const loading = ref(false);

// headers
const headers = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Email",
    key: "email",
  },
  {
    title: "Website",
    key: "website",
  },
  {
    title: "Status",
    key: "status",
  },
  {
    title: "ACTIONS",
    key: "actions",
  },
];

const resolveStatusVariant = (status) => {
  if (status === "A")
    return {
      color: "success",
      text: "Active",
    };
  else if (status === "I")
    return {
      color: "primary",
      text: "Inactive",
    };
  else
    return {
      color: "info",
      text: "No status",
    };
};

const openAddNewCompanyDrawer = async (companyData) => {
  if (companyData) {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "multipart/form-data",
        },
      };

      const response = await axios.get(`/companies/${companyData.id}`, config);

      editCompanyData.value = response.data.data;
      if (editCompanyData.value) {
        isEditMode.value = true;
        isAddNewCompanyDrawerVisible.value = true;
      }
    } catch (error) {
      console.error("Failed to fetch company details:", error.message);
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
};

const deleteItemConfirm = async () => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.post(
      `/companies/delete/${deleteItemId.value}`,
      { forceDelete: permentDelete.value },
      config
    );

    // Remove the company from the list
    userList.value = userList.value.filter(
      (company) => company.id !== deleteItemId.value
    );
    fetchData();

    // Close the delete dialog
    closeDelete();
  } catch (error) {
    console.error("Failed to delete company:", error.message);
  }
};

const handleNewUserData = (userData) => {
  userList.value.push(userData);
  fetchData();
  isAddNewCompanyDrawerVisible.value = false;
}

const fetchData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get("/companies", config);
    userList.value = response.data.data;
    console.log(response.data.data);
  } catch (error) {
    console.error("Failed to fetch company data:", error.message);
  }
  loading.value = false;
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
          Add New Company
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

        <template #item.status="{ item }">
          <VChip
            :color="resolveStatusVariant(item.raw.status).color"
            size="small"
            label
            class="text-capitalize"
          >
            {{ resolveStatusVariant(item.raw.status).text }}
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
        <VCardTitle> Are you sure you want to delete this item? </VCardTitle>
        <div class="demo-space-x">
          <VCheckbox v-model="permentDelete" label="Delete Permanently" />
        </div>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="closeDelete">
            Cancel
          </VBtn>
          <VBtn color="success" variant="elevated" @click="deleteItemConfirm">
            OK
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>
    <AddNewCompanyDrawer
      v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
      :company-data="editCompanyData"
      @user-data="handleNewUserData"
    />
  </div>
</template>