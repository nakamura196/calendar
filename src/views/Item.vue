
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

      <v-row class="fill-height mt-5">
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat color="white">
              <v-btn fab text small @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn fab text small @click="next">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
              <v-toolbar-title class="ml-5">{{ title }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu bottom right>
                <template v-slot:activator="{ on }">
                  <v-btn outlined v-on="on">
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>Day</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>Week</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>Month</v-list-item-title>
                  </v-list-item>
                  <!-- 
                  <v-list-item @click="type = '4day'">
                    <v-list-item-title>4 days</v-list-item-title>
                  </v-list-item>
                  -->
                </v-list>
              </v-menu>
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              color="primary"
              ref="calendar"
              v-model="focus"
              :events="events"
              :event-margin-bottom="3"
              :type="type"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="updateRange"
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col>
                      <a target="_blank" :href="selectedEvent.url">
                        <v-img :src="selectedEvent.thumbnail" :lazy-src="selectedEvent.thumbnail"></v-img>
                      </a>
                    </v-col>
                    <v-col>
                      <p>
                        <a target="_blank" :href="selectedEvent.url">
                          {{selectedEvent.name}}
                          <i class="fas fa-external-link-alt"></i>
                        </a>
                      </p>
                      {{selectedEvent.description}}
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <Footer :footer="footer" />
  </div>
</template>

<script>
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchForm from "../components/SearchForm";

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
      q: null,
      u: null,
      description: "",
      search_place_holder: "",
      index: {},
      collections: [],

      type: "month",
      events: [],
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day"
        //"4day": "4 Days"
      },
      focus: "2000-01-01",
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      yearAndMonth: ""
    };
  },
  computed: {
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  created: function() {
    let param = Object.assign({}, this.$route.query);

    this.u = param.u ? param.u : this.u;

    this.focus = param.date ? param.date + "-01" : "2020-01-01";
    let focus_arr = this.focus.split("-");
    this.yearAndMonth = focus_arr[0] + "-" + focus_arr[1];

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

      let events = [];

      for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        events.push({
          name: obj.label,
          start: obj.date,
          end: obj.date,
          url: obj.url,
          description: obj.description,
          thumbnail: obj.thumbnail
        });
      }

      this.events = events;
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
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    prev() {
      this.$refs.calendar.prev();
      this.updatePath();
    },
    next() {
      this.$refs.calendar.next();
      this.updatePath();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    handleDateClick(arg) {
      window.open(arg.event.id, "_blank");
    },
    updatePath() {
      let focus_arr = this.focus.split("-");
      let yearAndMonth = focus_arr[0] + "-" + focus_arr[1];
      this.$router.push({
        name: "item",
        query: {
          param: JSON.stringify({
            q: this.q,
            collections: this.collections
          }),
          date: yearAndMonth,
          u: this.u
        }
      });
    }
  }
};
</script>