import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
  ],
  
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isvalid = token !== null;

  if (to.path !== '/login' && !isvalid) {
    next('/login');
  } else if (to.path === '/login' && isvalid) {
    next('/');
  } else {
    next(); 
  }
});

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
export default router
