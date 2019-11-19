
<template>
  <v-card>
    <v-card-text>
      <v-form ref="form">
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <v-text-field
              v-on:keyup.enter="search"
              v-model="q_"
              :label="search_place_holder"
              name="q"
              class="mx-2"
            ></v-text-field>
          </v-flex>

          <v-flex xs12 sm6>
            <v-select
              :items="collections_query"
              label="コレクション / Collection"
              class="mx-2"
              multiple
              v-model="collections_"
            ></v-select>
          </v-flex>
        </v-layout>
        <v-btn color="primary" @click="search">Search</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ["collections_query", "q", "u", "collections", "search_place_holder"],
  data: function() {
    return {
      collections_: this.collections,
      q_: this.q
    };
  },

  methods: {
    search() {
      this.$parent.collections = this.collections_;
      this.$parent.q = this.q_;

      let param = {
        collections: this.collections_
      };

      if (this.q_) {
        param.q = this.q_;
      }

      this.$router.push({
        name: "index",
        query: {
          param: JSON.stringify(param),
          u: this.u
        }
      });
    }
  }
};
</script>