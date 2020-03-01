
<template>
  <div>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>{{header}}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items v-show="url">
        <v-btn text :to="{ path : '/', query : { u: u }}">{{ $t("message.home") }}</v-btn>
        <v-btn text target="_blank" :href="url">
          {{label}}
          <i class="ml-1 fas fa-external-link-alt"></i>
        </v-btn>
        <template v-if="$i18n.locale == 'ja'">
        <v-btn text v-on:click.prevent="handleClick_changeLanguage('en')">English</v-btn>
        </template>
        <template v-else>
        <v-btn text v-on:click.prevent="handleClick_changeLanguage('ja')">日本語</v-btn>
        </template>
      </v-toolbar-items>
    </v-app-bar>

    <v-container class="mt-5">{{description}}</v-container>
  </div>
</template>

<script>
export default {
  props: ["header", "url", "label", "u", "description"],
  methods: {
    handleClick_changeLanguage(lang) {
      this.$i18n.locale = lang;
    }
  }
};
</script>