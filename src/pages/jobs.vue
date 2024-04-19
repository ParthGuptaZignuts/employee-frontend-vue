<script setup>
// import necessary modules and components
import { avatarText } from "@/@core/utils/formatters";
import AddNewJobDrawer from "../views/AddNewJobDrawer.vue";
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
const items = [
  "Full Time",
  "Part Time",
  "Hybrid",
  "Work From Home",
  "Work From Office",
  "Internship",
];
const selectedFilter = ref(null);

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
    title: "Skills Required",
    key: "skills_required",
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

// Function to open add new job drawer
const openAddNewCompanyDrawer = async (employeeData) => {
  console.log(employeeData);
  if (employeeData) {
    try {
      const response = await axios.get(`/job/${employeeData.id}`);
      editCompanyData.value = response.data;
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
      toast("Job deleted successfully", {
        theme: "auto",
        type: "success",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    } catch (error) {
      toast("Failed to delete Job", {
        theme: "auto",
        type: "error",
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        dangerouslyHTMLString: true,
      });
    }
  }
};
// Function to handle new job data
const handleNewUserData = async (employeeData) => {
  try {
    loading.value = true;
    if (isEditMode.value) {
      let response = await axios.post(
        `/job/update/${editCompanyData.value.id}`,
        employeeData
      );
      if (response) {
        toast("Job Updated successfully", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
      }
    } else {
      let response = await axios.post("job/create", employeeData);
      if (response) {
        toast("Job Created Successfully", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
      }
    }

    fetchData();

    isAddNewCompanyDrawerVisible.value = false;
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
    const response = await axios.get("/jobs");
    userList.value = response.data;
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

// Watcher for search input
watch(
  [search, selectedFilter],
  async ([searchValue, filterValue], [prevSearchValue, prevFilterValue]) => {
    // Check if search value or filter value has changed
    if (searchValue !== prevSearchValue || filterValue !== prevFilterValue) {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        let apiUrl = "/jobs";
        const params = {};

        if (searchValue) {
          params.search = searchValue;
        }

        if (filterValue) {
          params.employment_type = filterValue;
        }

        const response = await axios.get(apiUrl, { params, ...config });
        userList.value = response.data;
      } catch (error) {
        console.error("Failed to fetch job data:", error.message);
      }
    }
  },
  { deep: true } // Set deep option to true to watch nested properties
);

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>

<!-- Template section -->
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

      <!-- search bar -->
      <div class="search-container d-flex align-center">
        <div class="search-input" style="width: 70%">
          <VTextField
            v-model="search"
            label="Search"
            outlined
            dense
            clearable
            placeholder="Search Jobs by Title"
          />
        </div>
        <!-- filter search -->
        <div class="filter-select" style="width: 30%">
          <AppSelect
            v-model="selectedFilter"
            :items="items"
            clearable
            clear-icon="tabler-x"
            single-line
            placeholder="Show By Type"
          />
        </div>
      </div>

      <!-- data table -->
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
    <!-- dialog to delete the items -->
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
    <!-- job drawer -->
    <AddNewJobDrawer
      v-model:isEmployeeDrawerOpen="isAddNewCompanyDrawerVisible"
      :employee-data="editCompanyData"
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
