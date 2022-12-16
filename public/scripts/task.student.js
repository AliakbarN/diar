import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

async function request (url, method = 'GET', data = null) {
    try {
        const headers = {};
        let body;

        if (data) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
        };

        const response = await fetch(url, {
            headers,
            body,
            method
        });

        console.log(response.status);
        return { st: response.status, res: await response.json() };
    } catch (err) {
        console.log(err);
        return { st: 404 };
    }
};

let taskID = '';

createApp({
  data() {
    return {
        students: [],
        statuses: [],
        searchText: '',
        title: 'Some text which will be get from server'
    }
  },
  methods: {
    changeStatus(id, index) {

        const currentStatus = document.getElementById(index).checked;

        request('/change/status/task', 'POST', { uID: id, taskID, status: currentStatus })
          .then( res => {
            
          })
    },
    pareseStatus(tasks) {
      for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        
        if (element.id === taskID) return element.status;
      }
    },
    search() {
      request(`/filter/students?name=${this.searchText}`)
        .then( res => {
          this.students = res.res;
        })
    }
  },
  mounted() {
    taskID = window.location.pathname.split('/')[2];

    request(`/get/basic-data?taskID=${taskID}`)
        .then( res => {
            this.students = res.res.stds;
            this.title = res.res.task.taskText
            console.log(res.res);
          })
  }
}).mount('body')