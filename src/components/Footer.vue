
<template>
  <v-footer class="mt-5">
    <v-container class="py-5 text-center">{{footer}}</v-container>
  </v-footer>
</template>

<script>
export default {
  props: ['footer'],
};
</script>