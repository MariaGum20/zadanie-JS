import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TransitView from './views/TransitView.vue'
import LoadedView from './views/LoadedView.vue'
import OtherStatusView from './views/OtherStatusView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/transit', component: TransitView, props: true },
  { path: '/loaded', component: LoadedView, props: true },
  { path: '/other', component: OtherStatusView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router