<script setup>
// Importing necessary modules and components
import { avatarText } from "@/@core/utils/formatters";
import AddNewEmployeeDrawer from "../views/AddNewEmployeeDrawer.vue";
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { computed } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { debounce } from "lodash";

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

// check usertype from local storage
const localcheck = localStorage.getItem("type");
localcheck !== "SA" ? (checkUser.value = false) : true;

// Reactive variables and references
const deleteDialog = ref(false);
const isAddNewEmployeeDrawerVisible = ref(false);
const editEmployeeData = ref(null);
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
const checkUser = ref(true);

// Computed property to check if submit button is enabled
const isSubmitEnabled = computed(() => permentDelete.value || tempDelete.value);

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

// Function to open add new employee drawer
const openAddNewCompanyDrawer = async (employeeData) => {
  if (employeeData) {
    try {
      const response = await axios.get(`/employee/${employeeData.id}`);
      editEmployeeData.value = response.data.data;
      if (editEmployeeData.value) {
        isEditMode.value = true;
        isAddNewEmployeeDrawerVisible.value = true;
      }
    } catch (error) {
      console.error("Failed to fetch employee details:", error.message);
    }
  } else {
    editEmployeeData.value = null;
    isEditMode.value = false;
    isAddNewEmployeeDrawerVisible.value = true;
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
      await axios.post(`/employee/${deleteItemId.value}`, {
        permanent_delete: permentDelete.value,
      });

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

// Function to handle new employee data
const handleNewUserData = async (employeeData) => {
  try {
    loading.value = true;
    if (isEditMode.value) {
      let response = await axios.post(
        `/employee/update/${editEmployeeData.value.id}`,
        employeeData
      );
      if (response) {
        toast("Employee Updated successfully", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
      }
    } else {
      let response = await axios.post("employee/create", employeeData);
      if (response) {
        toast("Employee Created Successfully", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
      }
    }

    fetchData();

    isAddNewEmployeeDrawerVisible.value = false;
    loading.value = false;
  } catch (error) {
    console.error("Failed to update or create Employee:", error.message);
    loading.value = false;
  }
};

// Function to fetch data call an api
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/employees");
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

// function to fetch companies
const fetchCompanyNames = async () => {
  try {
    const response = await axios.get("getallcompanies");
    items.value = response.data.data.map((company) => company.name);
    companyOptions.value = response.data.data.map((company) => ({
      id: company.id,
      name: company.name,
    }));
  } catch (error) {
    console.error("Error fetching company options:", error);
  }
};

// Watcher for search input
watch(
  [search, selectedFilter],
  async ([searchValue, filterValue], [prevSearchValue, prevFilterValue]) => {
    // Check if search value or filter value has changed
    if (  searchValue.length === 0 || (searchValue.length > 3 && searchValue !== prevSearchValue ) || filterValue !== prevFilterValue) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        let apiUrl = "/employees";
        const params = {};

        if (searchValue) {
          params.search = searchValue;
        }

        if (filterValue) {
          const selectedCompany = companyOptions.value.find(
            (company) => company.name === filterValue
          );
          if (selectedCompany) {
            params.search_filter = selectedCompany.id;
          }
        }

        const response = await axios.get(apiUrl, { params, ...config });
        userList.value = response.data.data;
      } catch (error) {
        console.error("Failed to fetch employee data:", error.message);
      }
    }
  },
  { deep: true } // Add the deep option to watch changes in nested values of reactive objects
);

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
        <div class="filter-select" style="width: 30%" v-if="checkUser">
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

            <!-- first name of employee -->
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
    <!-- dialog for permanent delete and temperary delete -->
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
            :disabled="!isSubmitEnabled"
            @click="deleteItemConfirm"
          >
            OK
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>
    <!-- employee side drawer -->
    <AddNewEmployeeDrawer
      v-model:isEmployeeDrawerOpen="isAddNewEmployeeDrawerVisible"
      :employee-data="editEmployeeData"
      @employee-data="handleNewUserData"
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
