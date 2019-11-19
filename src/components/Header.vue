
<template>
  <div>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>{{header}}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items v-show="url">
        <v-btn text :to="{ name : 'index', query : { u: u }}">HOME</v-btn>
        <v-btn text target="_blank" :href="url">
          {{label}}
          <i class="ml-1 fas fa-external-link-alt"></i>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-container class="mt-5">{{description}}</v-container>
  </div>
</template>

<script>
export default {
  props: ["header", "url", "label", "u", "description"]
};
</script>