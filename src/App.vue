<template>
  <v-app>

      

    <v-content>
      <router-view />
    </v-content>

    
  </v-app>
</template>

<script>
  export default {
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
    }),
  }
</script>
