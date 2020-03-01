
<template>
  <div>
    <Header
      :header="header"
      :url="return_url"
      :label="return_label"
      :u="u"
      :description="description"
    />

    <v-container class="mt-2 mb-5">
      <SearchForm
        :q="q"
        :collections="collections"
        :collections_query="index.collections ? Object.keys(index.collections) : []"
        :u="u"
        :search_place_holder="search_place_holder"
      />

      <v-card class="mt-5">
        <v-card-text>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr v-for="(item, index2) in items" :key="index2">
                  <th>{{ item.year }}<template v-if="$i18n.locale == 'ja'"> ({{item.wareki}}) 年</template></th>
                  <td class="text-xs-right" v-for="index in 12" :key="index">
                    <!-- <a :href="'list?q='+q+'&date=' + props.item.year + '-' + index + '&type=' + type" v-if="props.item.month[index-1] > 0">{{index}}月 ({{ props.item.month[index-1] }})</a> -->
                    <router-link
                      v-if="item.month[index-1] > 0"
                      v-bind:to="{ path : 'item', query : { param : JSON.stringify({q: q, collections: collections}), u: u, date: item.year + '-' + index }}"
                    >{{getMonthName(index)}} ({{ item.month[index-1] }})</router-link>
                    <span v-else>{{getMonthName(index)}}</span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-container>
    <Footer :footer="footer" />
  </div>
</template>

<script>
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchForm from "../components/SearchForm";

function toWareki(y) {
  let s = "";
  if (y > 1988) {
    s = "平成" + (y - 1988);
  } else if (y > 1925) {
    s = "昭和" + (y - 1925);
  } else if (y > 1911) {
    s = "大正" + (y - 1911);
  } else if (y > 1867) {
    s = "明治" + (y - 1867);
  }
  return s;
}

export default {
  components: {
    Header,
    Footer,
    SearchForm
  },
  data: function() {
    return {
      return_url: null,
      return_label: null,
      header: null,
      footer: null,
      items: [],
      data_all: [],
      q: "",
      u: null,
      description: "",
      search_place_holder: "",
      index: {},
      collections: []
    };
  },
  watch: {
    $route() {
      this.search();
    }
  },
  created: function() {
    let param = Object.assign({}, this.$route.query);

    if (!param.u) {
      //location.href = "https://github.com/nakamura196/calendar";
      return
    }
    this.u = param.u;

    if (param.param) {
      let query = JSON.parse(param.param);

      this.q = query.q ? query.q : this.q;
      this.collections = query.collections
        ? query.collections
        : this.collections;
    }

    axios.get(this.u).then(response => {
      let result = response.data;

      this.header = result.header;
      this.footer = result.footer;
      this.return_url = result.return_url;
      this.return_label = result.return_label;

      this.description = result.description;
      this.search_place_holder = result.search_place_holder;

      let data = result.data;
      this.data_all = data;

      let index = {
        fulltext: {}
      };

      for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let fulltext = "";

        for (let key in obj) {
          if (!index[key]) {
            index[key] = {};
          }
          let values = obj[key];
          if (!(values instanceof Array)) {
            values = [values];
          }
          for (let j = 0; j < values.length; j++) {
            let value = values[j];

            //URIの場合は無視
            if(value.startsWith("http")){
              continue
            }

            fulltext += value + " ";
            if (!index[key][value]) {
              index[key][value] = [];
            }
            index[key][value].push(i);
          }
        }
        index["fulltext"][fulltext] = [i];
      }

      this.index = index;

      this.search();
    });
  },
  methods: {
    search() {
      let data = this.filter();

      let items = [];
      this.items = items;

      var min_year = 2000;
      var max_year = 0;
      var map = {};

      for (let i = 0; i < data.length; i++) {
        let obj = data[i];

        let date = obj.date;
        let c = 1;

        let tmp = date.split("-");
        let year = Number(tmp[0]);

        if (year < min_year) {
          min_year = year;
        }

        if (year > max_year) {
          max_year = year;
        }

        let month = Number(tmp[1]);

        if (!map[year]) {
          map[year] = {};
        }

        let tmp2 = map[year];

        if (!tmp2[month]) {
          tmp2[month] = 0;
        }

        tmp2[month] += c;
      }

      for (let year = min_year; year <= max_year; year++) {
        let obj = {
          year: year,
          wareki: toWareki(year),
          month: []
        };

        let tmp = map[year];

        for (let month = 1; month <= 12; month++) {
          let value = tmp != null && tmp[month] ? tmp[month] : 0;
          obj.month.push(value);
        }

        items.push(obj);
      }
    },
    filter() {
      let index = this.index;

      let collection_index = [];
      let fulltext_index = [];

      let collections = this.collections;

      if (collections.length == 0) {
        for (let key in index.collections) {
          collection_index = collection_index.concat(index.collections[key]);
        }
      } else {
        for (let i = 0; i < collections.length; i++) {
          let collection = collections[i];
          let index_arr = index.collections[collection];
          collection_index = collection_index.concat(index_arr);
        }
      }

      let q = this.q;
      if (!q) {
        for (let key in index.fulltext) {
          fulltext_index = fulltext_index.concat(index.fulltext[key]);
        }
      } else {
        for (let key in index.fulltext) {
          if (key.indexOf(q) != -1) {
            fulltext_index = fulltext_index.concat(index.fulltext[key]);
          }
        }
      }

      const x = new Set(collection_index);
      const y = new Set(fulltext_index);
      const intersection = new Set([...x].filter(e => y.has(e))); //2, 3

      let data = [];
      for (var value of intersection) {
        data.push(this.data_all[value]);
      }

      return data;
    },
    getMonthName(index){
      if(this.$i18n.locale == "ja"){
        return index+"月"
      } else {
        const month_english_list = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return month_english_list[index - 1]
      }
      
      
    }
  }
};
</script>