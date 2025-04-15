import {createRouter, createWebHistory} from "vue-router";
import mainView from "@/pages/mainView.vue";
import clientAuth from "@/pages/clientAuth.vue";
import allCompains from "@/pages/allCompains.vue";
import compainsAuth from "@/pages/compainsAuth.vue";
import loyalty from "@/pages/loyalty.vue";
import detailedLoyalty from "@/pages/detailedLoyalty.vue";
import personalBusinessAccount from "@/pages/personalBusinessAccount.vue";
import loyaltyMaker from "@/pages/loyaltyMaker.vue";
import companyLoyals from "@/pages/companyLoyals.vue";


const routes = [
    {
        path: '/',
        component: mainView
    },
    {
        path: '/client/login',
        component: clientAuth
    },
    {
        path: '/companies',
        component: allCompains
    },
    {
        path: '/business',
        component: personalBusinessAccount
    },
    {
        path: '/business/maker',
        component: loyaltyMaker
    },
    {
        path: '/compains/auth',
        component: compainsAuth
    },
    {
        path: '/loyalty',
        component: loyalty
    },
    {
        path: '/campaigns/loyals/:id',
        component: companyLoyals
    },
    {
        path: '/loyalty/detailed/:id',
        component: detailedLoyalty
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes

})

export default router