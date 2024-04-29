<script setup>
// Importing necessary functions and components
import { avatarText } from "@/@core/utils/formatters";
import AddNewCompanyDrawer from "@/views/AddNewCompanyDrawer.vue";
import { onMounted, ref, watch, computed } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { debounce } from "lodash";

// Headers for data table
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
    title: "Location",
    key: "address",
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

// Reactive variables and references
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
const items = ["Active Companies", "In-Active Companies"];
const selectedFilter = ref(null);

// Computed property to check if submit button is enabled
const isSubmitEnabled = computed(() => permentDelete.value || tempDelete.value);

// Function to determine chip variant based on status
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

// Function to open add new company drawer
const openAddNewCompanyDrawer = async (companyData) => {
  if (companyData) {
    try {
      const response = await axios.get(`/companies/${companyData.id}`);

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

// Function to delete item
const deleteItem = (item) => {
  deleteItemId.value = item;
  deleteDialog.value = true;
};

// Function to close delete dialog
const closeDelete = () => {
  deleteDialog.value = false;
  permentDelete.value = false;
  tempDelete.value = false;
};


// Function to confirm deletion of item
const deleteItemConfirm = async () => {
  if (isSubmitEnabled.value) {
    try {
      await axios.post(`/companies/delete/${deleteItemId.value}`, {
        force_delete: permentDelete.value,
      });
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

// Function to handle new user data
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

// Function to fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/companies");
    userList.value = response.data.data;
  } catch (error) {
    console.error("Failed to fetch company data:", error.message);
  }
  loading.value = false;
};

// Function to handle delete option change
const handleDeleteOptionChange = (option) => {
  if (option === "permanent") {
    tempDelete.value = false;
  } else if (option === "temporary") {
    permentDelete.value = false;
  }
};

// Debounced search function
const debouncedSearch = debounce(() => {
  if(search.value.length > 3) {
  console.log("Searching for:", search.value);
  }
}, 500);

// Watcher for search input
watch(
  [search, selectedFilter],
  async ([searchValue, filterValue], [prevSearchValue, prevFilterValue]) => {
    // Check if search value or filter value has changed
    if (searchValue.length > 3 && searchValue !== prevSearchValue || filterValue !== prevFilterValue) {
      try {
        let status = null;
        if (filterValue === "Active Companies") {
          status = "A";
        } else if (filterValue === "In-Active Companies") {
          status = "I";
        }

        const response = await axios.get(
          `/companies?search=${searchValue}&status=${status}`
        );
        userList.value = response.data.data;
      } catch (error) {
        console.error("Failed to fetch company data:", error.message);
      }
    }
  },
  { deep: true } // Add the deep option to watch changes in nested values of reactive objects
);

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>

<!-- Template section -->
<template>
  <div>
    <!-- Loading indicator -->
    <div v-if="loading" class="d-flex justify-center">
      <VProgressCircular :size="40" color="primary" indeterminate />
    </div>
    <!-- Main content -->
    <div v-else>
      <!-- Add new company button -->
      <div class="d-flex justify-end ma-3">
        <VBtn prepend-icon="tabler-plus" @click="openAddNewCompanyDrawer(null)">
          Add New Company
        </VBtn>
      </div>
      <!-- Search and filter section -->
      <div class="search-container d-flex align-center">
        <!-- Search input -->
        <div class="search-input" style="width: 70%">
          <VTextField
            v-model="search"
            label="Search"
            outlined
            dense
            clearable
            placeholder="Search Company by Name"
          />
        </div>
        <!-- Filter select -->
        <div class="filter-select" style="width: 30%">
          <AppSelect
            v-model="selectedFilter"
            :items="items"
            clearable
            clear-icon="tabler-x"
            single-line
            placeholder="show All Companies"
          />
        </div>
      </div>
      <!-- Data table -->
      <VDataTable :headers="headers" :items="userList" :items-per-page="10">
        <!-- Custom template for each row -->
        <template #item.name="{ item }">
          <!-- Company avatar -->
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
            <!-- Company name -->
            <div class="d-flex flex-column ms-3">
              <span
                class="d-block font-weight-medium text--primary text-truncate"
                >{{ item.raw.name }}</span
              >
            </div>
          </div>
        </template>
        <!-- Custom template for company email -->
        <template #item.company_email="{ item }">
          <span>{{ item.raw.company_email }}</span>
        </template>
        <!-- Custom template for website -->
        <template #item.website="{ item }">
          <a :href="item.raw.website" target="_blank" rel="noopener noreferrer"
            ><span>{{ item.raw.name }}</span></a
          >
        </template>
        <!-- Custom template for status -->
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
        <!-- Custom template for actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <!-- Edit button -->
            <IconBtn @click="openAddNewCompanyDrawer(item.raw)">
              <VIcon icon="mdi-pencil-outline" />
            </IconBtn>
            <!-- Delete button -->
            <IconBtn @click="deleteItem(item.raw.id)">
              <VIcon icon="mdi-delete-outline" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </div>
    <!-- Delete dialog -->
    <VDialog v-model="deleteDialog" max-width="500px">
      <VCard>
        <VCardTitle class="text-center d-flex align-center justify-center mb-3">
          Are you sure you want to delete this item?
        </VCardTitle>
        <!-- Checkbox for permanent delete -->
        <div class="text-center d-flex align-center justify-center mb-5">
          <VCheckbox
            v-model="permentDelete"
            label="DELETE ITEM PERMANENTLY"
            name="del"
            @change="handleDeleteOptionChange('permanent')"
          />
        </div>
        <!-- Checkbox for temporary delete -->
        <div class="text-center d-flex align-center justify-center mb-5">
          <VCheckbox
            v-model="tempDelete"
            label="DELETE ITEM TEMPORARILY"
            name="del"
            @change="handleDeleteOptionChange('temporary')"
          />
        </div>
        <!-- Dialog actions -->
        <VCardActions>
          <VSpacer />
          <!-- Cancel button -->
          <VBtn color="error" variant="outlined" @click="closeDelete">
            Cancel
          </VBtn>
          <!-- OK button -->
          <VBtn
            color="success"
            variant="elevated"
            :disabled="!isSubmitEnabled"
            @click="deleteItemConfirm"
          >
            OK
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>
    <!-- Add new company drawer -->
    <AddNewCompanyDrawer
      v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
      :company-data="editCompanyData"
      @user-data="handleNewUserData"
    />
  </div>
</template>

<!-- Scoped styles -->
<style scoped>
.search-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.search-input {
  width: 70%;
  margin-right: 0.625rem;
}

.filter-select {
  width: 30%;
}

.v-text-field {
  width: 100%;
}
</style>
