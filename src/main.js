import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import VueI18n from 'vue-i18n'

// If using a module system (e.g. via vue-cli), import Vue and VueI18n and then call Vue.use(VueI18n).
// import Vue from 'vue'
// import VueI18n from 'vue-i18n'
//
Vue.use(VueI18n)

// Ready translated locale messages
const messages = {
  en: {
    message: {
      home: 'HOME',
      search: "Search",
      collection: "Collection",
      day : "Day",
      week : "Week",
      month: "Month"
    }
  },
  ja: {
    message: {
      home: 'ホーム',
      search: "検索",
      collection: "コレクション",
      day : "日",
      week : "週",
      month: "月"
    }
  }
}

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'ja', // set locale
  messages, // set locale messages
})

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
