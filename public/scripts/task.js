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

createApp({
  data() {
    return {
      tasks: [],
      isAdd: false,
      isteacher: false,
      inputValue: {
        task: '',
        pass: ''
      },
      classes: {
        modal: 'modal fade',
        section: 'ftco-section'
      },
      modalTitle: 'Password :'
    }
  },
  methods: {
    changeInputData (dir, event) {
        switch(dir) {
            case 'task':
                this.inputValue.task = event.target.value;
            break;
            case 'pass':
                this.inputValue.pass = event.target.value;
            break;
        }
    },
    async attach() {
        this.isAdd = !this.isAdd;
        console.log(this.inputValue.task);

        const res = await request('/save/task', 'POST', { task: this.inputValue.task })
        
        this.tasks.push(res.res)
    },
    openModal() {
        this.classes.modal += ' show block hide';
        this.classes.section += ' blur';
    },
    closeModal() {
        let arr1 = this.classes.modal.split(' ');
        let arr2 = this.classes.section.split(' ');

        this.classes.modal = `${arr1[0]} ${arr1[1]}`;
        this.classes.section = arr2[0];
    },
    sendPass() {
        console.log(this.inputValue.pass);
        request('/checkuser', 'POST', { pass: this.inputValue.pass })
            .then( res => {
                console.log(res);
                if (res.st >= 400) {
                    this.modalTitle = 'Wrong password';
                    this.inputValue.pass = '';
                } else {
                    this.modalTitle = 'Password :';
                    this.isteacher = true;
                    this.inputValue.pass = '';
                    this.closeModal();
                }
            })
    },
    deleteTask(id) {

        if (!this.isteacher) return;

        request('/delete', 'POST', { id })
            .then( res => {
                if (res.st < 400) {
                    this.tasks = this.tasks.filter( task => task._id !== id);
                }
            })
    },
    openStudentsList(id) {
        if (!this.isteacher) return;

        window.location.assign(`/task/${id}`)
    }
  },
  mounted() {
    request('/get/tasks')
        .then(res => {
            this.tasks = res.res;
            console.log(this.tasks);
        })
  }
}).mount('body')