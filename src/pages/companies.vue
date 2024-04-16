<script setup>
import { avatarText } from "@/@core/utils/formatters";
import AddNewCompanyDrawer from "@/views/AddNewCompanyDrawer.vue";
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { computed } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { debounce } from "lodash";

const deleteDialog = ref(false);
const isAddNewCompanyDrawerVisible = ref(false);
const editCompanyData = ref(null);
const isEditMode = ref(false);
const deleteItemId = ref(null);
const userList = ref([]);
const permentDelete = ref(false);
const tempDelete = ref(false);
const loading = ref(false);
const search = ref("");

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
        `/companies/delete/${deleteItemId.value}`,
        { force_delete: permentDelete.value },
        config
      );
      userList.value = userList.value.filter(
        (company) => company.id !== deleteItemId.value
      );
      fetchData();
      closeDelete();
      toast("Company deleted successfully", {
        theme: "auto",
        type: "success",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    } catch (error) {
      console.error("Failed to delete company:", error.message);
      toast("Failed to delete company", {
        theme: "auto",
        type: "error",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    }
  }
};

const handleNewUserData = (userData) => {
  userList.value.push(userData);
  fetchData();
  isAddNewCompanyDrawerVisible.value = false;

  if (!editCompanyData.value) {
    toast("Company created successfully", {
      theme: "auto",
      type: "success",
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      dangerouslyHTMLString: true,
    });
  } else {
    toast("Company edited successfully", {
      theme: "auto",
      type: "success",
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      dangerouslyHTMLString: true,
    });
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
    const response = await axios.get("/companies", config);
    userList.value = response.data.data;
    console.log(response.data.data);
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

const debouncedSearch = debounce(() => {
  console.log("Searching for:", search.value);
}, 500);

watch(search, () => {
  debouncedSearch();
});

watch(search, async (newValue, oldValue) => {

  if (newValue !== oldValue) {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`/companies?search=${newValue}`, config);
      userList.value = response.data.data;
    } catch (error) {
      console.error("Failed to fetch company data:", error.message);
    }
  }
});

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

      <div class="search-container">
        <VTextField
          v-model="search"
          label="Search"
          outlined
          dense
          clearable
          placeholder="Search Company by Name"
        />
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
    <AddNewCompanyDrawer
      v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
      :company-data="editCompanyData"
      @user-data="handleNewUserData"
    />
  </div>
</template>
<style scoped>
.search-container {
  margin-bottom: 20px;
}
.v-text-field {
  width: 100%;
}
</style>
