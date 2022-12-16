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
        students: [],
        filteredStudent: [],
        searchText: '',
        studentName: '',
        studentLastName: '',
        filterValue: 5,
        filterCount: 0,
        maxCount: 0,
        modalCls: 'modal fade'
    }
  },
  methods: {
    changeInputData (dir, event) {
        switch(dir) {
            case 'filter':
                this.filterValue = event.target.value;

                this.filterCount = Math.round((this.filterValue / 10) * this.maxCount);

                this.sort(this.filterCount);
            break;
            case 'name':
                this.studentName = event.target.value;
            break;
            case 'last name':
                this.studentLastName = event.target.value;
            break;
        }
    },
    openModal() {
        this.modalCls += ' show block hide';
    },
    closeModal() {
        let arr1 = this.modalCls.split(' ');

        this.modalCls = `${arr1[0]} ${arr1[1]}`;
    },
    search() {
        console.log(this.searchText);
        request(`/filter/students?name=${this.searchText}`)
          .then( res => {
            this.students = res.res;

            for (let i = 0; i < this.students.length; i++) {
                this.students[i].statisc = this.getStatisc(this.students[i].tasks);
            };

            this.filteredStudent = [...this.students];
          })
    },
    getStatisc (tasks) {
        let doneCount = 0;
        if (tasks.length === 0) return 0;
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].status) doneCount++;
        };

        return (Math.round((doneCount / tasks.length) * 10) / 10) * 100;
    },
    sort(v) {
        console.log('sort', v);
        this.filteredStudent = [...this.students];

        for (let i = 0; i < this.students.length; i++) {
            let doneCount = 0;

            for (let j = 0; j < this.students[i].tasks.length; j++) {
                if (this.students[i].tasks[j].status) doneCount++;
            };
            if (doneCount <= v) console.log(true);
            else {
                this.students[i].hide = true;
            };
        }

        this.filteredStudent = this.students.filter( std => !std.hide);
        this.students = this.students.map( std => {
            std.hide = false;
            return std;
        });
        console.log(this.students);
    },
    async saveStudent() {
        console.log(this.studentName, this.studentLastName);
        if (this.studentName.length < 3 & this.studentLastName.length < 3) return;

        let res = await request('/save/student', 'POST', { name: this.studentName, last_name: this.studentLastName });
        res.res.statisc = this.getStatisc(res.res.tasks);
        console.log(res.res);
        this.students.push(res.res);
        this.filteredStudent = [...this.students];
        this.closeModal();
    },
    deleteStudent(id) {
        request('/delete/student', 'POST', { stdID: id })
            .then( res => {
                this.students = this.students.filter( std => std._id !== id);
                this.filteredStudent = [...this.students];
            })
    },
  },
  mounted() {

    request(`/get/basic-data?taskID=no`)
    .then( res => {
        this.students = res.res.stds;
        console.log(res.res);

        for (let i = 0; i < this.students.length; i++) {
            this.students[i].statisc = this.getStatisc(this.students[i].tasks);
        };

        this.filteredStudent = [...this.students];

        this.filteredStudent.sort((a, b) => b.statisc - a.statisc);

        this.maxCount = this.students[0].tasks.length;
      })

  }
}).mount('body')