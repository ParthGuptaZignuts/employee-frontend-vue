<script setup>
// Importing necessary functions and components
import { avatarText } from "@/@core/utils/formatters";
import AddNewEmployeeDrawer from "../views/AddNewEmployeeDrawer.vue";
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { computed } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { debounce } from "lodash";

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
const items = ref([]);
const selectedFilter = ref(null);
const companyOptions = ref([]);
const checkUser = ref(true)

// check usertype from local storage
const localcheck = localStorage.getItem("type");
(localcheck !== "SA") ? checkUser.value = false : true;

// Headers for data table
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

// Function to determine chip variant based on status
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

// Function to open add new company drawer
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

// Computed property to check if submit button is enabled
const isSubmitEnabled = computed(() => permentDelete.value || tempDelete.value);

// Function to confirm deletion of item
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
      toast("Employee deleted successfully", {
        theme: "auto",
        type: "success",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    } catch (error) {
      console.error("Failed to delete employee:", error.message);
      toast("Failed to delete Employee", {
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
const handleNewUserData = async (employeeData) => {
  try {
    loading.value = true;

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    if (isEditMode.value) {
      let response = await axios.post(
        `/employee/update/${editCompanyData.value.id}`,
        employeeData,
        config
      );
      toast("Employee Updated successfully", {
        theme: "auto",
        type: "success",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    } else {
      let response = await axios.post("employee/create", employeeData, config);
      toast("Employee Created Successfully", {
        theme: "auto",
        type: "success",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    }

    fetchData();

    isAddNewCompanyDrawerVisible.value = false;
    loading.value = false;
  } catch (error) {
    console.error("Failed to update or create Employee:", error.message);
    loading.value = false;
  }
};

// Function to fetch data
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
  console.log("Searching for:", search.value);
}, 500);

// function to fetch companies
const fetchCompanyNames = async () => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get("getallcompanies", config);
    items.value = response.data.map(company => company.name);
    companyOptions.value = response.data.map(company => ({
      id: company.id,
      name: company.name
    }));
  } catch (error) {
    console.error("Error fetching company options:", error);
  }
};

// Watcher for search input
watch(search, () => {
  debouncedSearch();
});

watch(search, async (newValue, oldValue) => {
  // Only send a request if the search term has changed
  if (newValue !== oldValue) {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`/employees?search=${newValue}`, config);
      userList.value = response.data.data;
    } catch (error) {
      console.error("Failed to fetch company data:", error.message);
    }
  }
});

// Watcher for selected filter change
watch(selectedFilter, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    try {
      if (!newValue) {
        await fetchData();
      } else {
        const selectedCompany = companyOptions.value.find(company => company.name === newValue);
        if (selectedCompany) {
          const token = localStorage.getItem("token");
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const response = await axios.get(`/employees?search_filter=${selectedCompany.id}`, config);
          userList.value = response.data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error.message);
    }
  }
});

// Fetch data with company names on component mount 
onMounted(() => {
  fetchData();
  fetchCompanyNames();
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
       <!-- Add new employee button -->
      <div class="d-flex justify-end ma-3">
        <VBtn prepend-icon="tabler-plus" @click="openAddNewCompanyDrawer(null)">
          Add New Employee
        </VBtn>
      </div>

      <!-- Search and filter section -->
      <div class="search-container d-flex align-center">
        <!-- Search input -->
        <VRow class="search-input">
          <VCol cols="12">
            <VTextField
              v-model="search"
              label="Search"
              outlined
              dense
              clearable
              placeholder="Search Company by Name"
            />
          </VCol>
        </VRow>
        <!-- Filter select -->
        <div class="filter-select" style="width: 30%;" v-if="checkUser">
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

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 70%;
  margin-right: 10px;
}

.filter-select {
  width: 30%;
}

.v-text-field {
  width: 100%;
}
</style>