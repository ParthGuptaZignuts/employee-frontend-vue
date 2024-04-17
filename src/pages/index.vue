<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "../axiosFile.js";

const userData = ref(null);
const isLoading = ref(false);
const error = ref(null);

const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token available");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    isLoading.value = true;

    const response = await axios.get("/statistics", config);
    userData.value = response.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
const userType = localStorage.getItem("type");

const userListMeta = computed(() => {
  if (userType === "SA")
    return [
      {
        icon: "tabler-users",
        color: "Primary",
        title: "Company Admins Associates with us",
        stats: userData.value ? userData.value.total_ca : "N/A",
      },
      {
        icon: "tabler-users-group",
        color: "Primary",
        title: "Total Employess Associates with us",
        stats: userData.value ? userData.value.total_employees : "N/A",
      },
      {
        icon: "tabler-layout-dashboard",
        color: "Primary",
        title: "Total companies Under Us ",
        stats: userData.value ? userData.value.total_companies : "N/A",
      },
      {
        icon: "tabler-tie",
        color: "Primary",
        title: "Numbers of Jobs",
        stats: userData.value ? userData.value.total_jobs : "N/A",
        subtitle: "Number of job opening currently active",
      },
    ];
  if (userType === "CA") {
    return [
      {
        icon: "tabler-users-group",
        color: "Primary",
        title: "Total Employess Associates with us",
        stats: userData.value ? userData.value.total_employees : "N/A",
      },
      {
        icon: "tabler-tie",
        color: "Primary",
        title: "Numbers of Jobs",
        stats: userData.value ? userData.value.total_jobs : "N/A",
        subtitle: "Number of job opening currently active",
      },
    ];
  }
});

onMounted(() => {
  fetchData();
});
</script>

<template>  
  <div>
    <div>
      <VRow>
        <VCol
          v-for="meta in userListMeta"
          :key="meta.title"
          cols="12"
          sm="6"
          lg="3"
        >
          <VCard class="fixed-height-card">
            <VCardText class="d-flex justify-space-between">
              <div>
                <span>{{ meta.title }}</span>
                <div class="d-flex align-center gap-2 my-1">
                  <h6 class="text-h4">
                    {{ meta.stats }}
                  </h6>
                </div>
              </div>

              <VAvatar
                rounded
                variant="tonal"
                :color="meta.color"
                :icon="meta.icon"
              />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>

<style scoped>
.fixed-height-card {
  height: 120px;
}
</style>
