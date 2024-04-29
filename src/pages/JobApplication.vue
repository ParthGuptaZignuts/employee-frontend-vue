<script setup>
// import necessary modules and components
import { avatarText } from "@/@core/utils/formatters";
import AddNewJobApplicationDrawer from "../views/AddNewJobApplicationDrawer.vue";
import { onMounted, ref } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import axios from "../axiosFile.js";
import { computed } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { debounce } from "lodash";

// headers
const headers = [
  {
    title: "Application No",
    key: "application_id",
  },
  {
    title: "Name Of The Candidate",
    key: "candidate_name",
  },
  {
    title: "Company Applied In",
    key: "company_name",
  },
  {
    title: "Postion Applied for",
    key: "job_title",
  },
  {
    title: "Resume",
    key: "resume_path",
  },
  {
    title: "Status",
    key: "status",
  },
  {
    title: "Actions",
    key: "actions",
  },
];

// Reactive variables and references
const deleteDialog = ref(false);
const isAddNewJobApplicationDrawer = ref(false);
const editJobApplicationData = ref(null);
const isEditMode = ref(false);
const deleteItemId = ref(null);
const userList = ref([]);
const permentDelete = ref(false);
const tempDelete = ref(false);
const loading = ref(false);
const search = ref("");
const selectedFilter = ref(null);

// Computed property to check if submit button is enabled
const isSubmitEnabled = computed(() => permentDelete.value || tempDelete.value);

// status
const resolveStatus = (status) => {
  switch (status) {
    case "P":
      return { text: "Pending", color: "secondary" };
    case "R":
      return { text: "Rejected", color: "error" };
    case "A":
      return { text: "Approved", color: "success" };
    default:
      return { text: "Unknown", color: "grey" };
  }
};

// Function to open add new job drawer
const openAddNewJobApplicationDrawer = async (CandidateData) => {
  if (CandidateData) {
    try {
      const response = await axios.get(
        `/allCandidateInfo/${CandidateData.application_id}`
      );
      editJobApplicationData.value = response.data.data;
      if (editJobApplicationData.value) {
        isEditMode.value = true;
        isAddNewJobApplicationDrawer.value = true;
      }
    } catch (error) {
      console.error("Failed to fetch employee details:", error.message);
    }
  } else {
    editJobApplicationData.value = null;
    isEditMode.value = false;
    isAddNewJobApplicationDrawer.value = true;
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
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
        const params = {
          hard: permentDelete.value,
        };

      // Update the delete request to include the token in the headers
      await axios.post(`/allCandidateInfo/delete/${deleteItemId.value}`, null, {
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
      fetchData();
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
const handleNewUserData = async (formData) => {
  try {
    loading.value = true;
    if (isEditMode.value) {
      let response = await axios.post(
        `/allCandidateInfo/update/${formData.application_id}`,
        formData
      );
      if (response) {
        toast("Job Status Updated successfully", {
          theme: "auto",
          type: "success",
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          dangerouslyHTMLString: true,
        });
      }
    }

    fetchData();

    isAddNewJobApplicationDrawer.value = false;
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
    const response = await axios.get("/allCandidateInfo");
    userList.value = response.data.data;
  } catch (error) {
    console.error("Failed to Candidate data:", error.message);
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
        userList.value = response.data.data;
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
      <!-- data table -->
      <VDataTable :headers="headers" :items="userList" :items-per-page="10">
        <template #item.application_id="{ item }">
          <span>{{ item.raw.application_id }}</span>
        </template>

        <template #item.candidate_name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              :color="item.raw.avatar ? '' : 'primary'"
              :class="item.raw.avatar ? '' : 'v-avatar-light-bg primary--text'"
              :variant="!item.raw.avatar ? 'tonal' : undefined"
            >
              <span>{{ avatarText(item.raw.candidate_name) }}</span>
            </VAvatar>

            <div class="d-flex flex-column ms-3">
              <span
                class="d-block font-weight-medium text--primary text-truncate"
                >{{ item.raw.candidate_name }}</span
              >
            </div>
          </div>
        </template>

        <template #item.company_name="{ item }">
          <span>{{ item.raw.company_name }}</span>
        </template>

        <template #item.job_title="{ item }">
          <span>{{ item.raw.job_title }}</span>
        </template>

        <template #item.resume_path="{ item }">
          <a
            :href="`http://127.0.0.1:8000/storage/${item.raw.resume_path}`"
            target="_blank"
            rel="noopener noreferrer"
            >Download</a
          >
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="resolveStatus(item.raw.status).color"
            size="small"
            label
            class="text-capitalize"
          >
            <span>{{ resolveStatus(item.raw.status).text }}</span>
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn @click="openAddNewJobApplicationDrawer(item.raw)">
              <VIcon icon="mdi-pencil-outline" />
            </IconBtn>
            <IconBtn @click="deleteItem(item.raw.application_id)">
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
    <AddNewJobApplicationDrawer
      v-model:isEmployeeDrawerOpen="isAddNewJobApplicationDrawer"
      :employee-data="editJobApplicationData"
      @formData="handleNewUserData"
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
