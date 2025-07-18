import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoadedView from '../views/LoadedView.vue'
import TransitView from '../views/TransitView.vue'
import OtherStatusView from '../views/OtherStatusView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/loaded',
    name: 'Loaded',
    component: LoadedView,
    props: route => ({ queueNumber: route.query.queue })
  },
  {
    path: '/transit',
    name: 'Transit',
    component: TransitView,
    props: route => ({ orderNumber: route.query.order })
  },
  {
    path: '/other',
    name: 'OtherStatus',
    component: OtherStatusView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router