<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import { useRouter } from 'vue-router'
import axios from '../../axiosFile'
import { ref } from 'vue'

const router = useRouter()
const userData = ref(null)

const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('Token not found in localStorage')
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const response = await axios.get('/user', config)
    userData.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error.message)
  }
}

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token')

    if (token) {
    
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.post('/logout', null, config)

      if (response.status === 200) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } else {
      console.error('Token not found in localStorage')
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(() => {
  fetchUserData()
})
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userData.first_name }} - {{ userData.last_name}}
            </VListItemTitle>
            <VListItemSubtitle v-if="userData.type === 'SA'">Super Admin</VListItemSubtitle>
            <VListItemSubtitle v-else-if="userData.type === 'CA'">Company Admin</VListItemSubtitle>
            <VListItemSubtitle v-else-if="userData.type === 'CE'">Company Employee</VListItemSubtitle>
            <VListItemSubtitle v-else-if="userData.type === 'C'">Candidate</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-user"
                size="22"
              />
            </template>

            <VListItemTitle>{{ userData.email }}</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="handleLogout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
