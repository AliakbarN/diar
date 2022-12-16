require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
const app = express()
const mongoose = require('mongoose')
const TaskModel = require('./server/db/models/task')
const StudentModel = require('./server/db/models/student')
const Helper = require('./server/helper')
const dldist = require('weighted-damerau-levenshtein')

mongoose
  .connect(process.env['DB_URL'], { useNewUrlParser: true, useUnifiedTopology: true })
  .then( res => console.log('Conected to DB'))
  .catch( err => console.log(err));

app
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

app
  .get('/tasks', (req, res) => res.render('pages/task'))
  .get('/students', (req, res) => res.render('pages/students'))
  .get('/task/:id', (req, res) => res.render('pages/index'))
  .get('/get/tasks', async (req, res) => {
    const tasks = await TaskModel.find();
    
    res.json(tasks);
  })
  .get('/get/basic-data', async (req, res) => {
    let stds = await StudentModel.find().lean();
    const { taskID } = req.query;
    let task = {};

    for (let i = 0; i < stds.length; i++) {
      stds[i].tasks = JSON.parse(stds[i].tasks);
      stds[i]['statisc'] = 0;
      stds[i]['hide'] = false;
    };

    if (taskID !== 'no') task = await TaskModel.findById(taskID);

    res.json({ stds, task });
  })
  .get('/filter/students', async (req, res) => {
    const { name } = req.query;
    console.log(name);
    const stds = await StudentModel.find();
    const compr = new Helper.comparison(dldist);

    for (let i = 0; i < stds.length; i++) {
      stds[i]['dist'] = compr.get(name, `${stds[i].name} ${stds[i].last_name}`);
    }

    stds.sort((a, b) => a.dist - b.dist);

    res.json(stds);
  })
  .get('/task/name', async (req, res) => {
    const { taskID } = req.query;
    console.log(taskID);
    const resFromDb = await TaskModel.findById(taskID);

    res.json(resFromDb);
  })

app
  .post('/save/task', async (req, res) => {
    const taskText = req.body['task'];

    const task = new TaskModel({ taskText });
    const resFromDb = await task.save();
    const stds = await StudentModel.find();

    for (let i = 0; i < stds.length; i++) {
      let stt = JSON.parse(stds[i].tasks);
      stt.push({ id: resFromDb._id, status: false });

      stds[i].tasks = JSON.stringify(stt);

      await stds[i].save();
    };

    res.json(resFromDb);
  })
  .post('/checkuser', async (req, res) => {
    const pass = req.body['pass'];

    if (pass !== process.env['ADMIN_PASS']) return res.status(404).json('No');

    res.status(200).json('ok');
  })
  .post('/delete/task', async (req, res) => {
    const taskId = req.body['id'];

    const resFromDb = await TaskModel.findByIdAndDelete(taskId);

    if (!resFromDb) return res.status(500).json('no');

    const stds = await StudentModel.find();

    for (let i = 0; i < stds.length; i++) {
      let stt = JSON.parse(stds[i].tasks);
      let delIndex = -1;

      for (let j = 0; j < stt.length; j++) {
        if (stt[j].id === taskId) {
          delIndex = j;
          break
        }
      }

      if (delIndex !== -1) {
        stt.splice(delIndex, 1);
      }

      stds[i].tasks = JSON.stringify(stt);

      await stds[i].save();
    }

        res.status(200).json('ok');
  })
  .post('/change/status/task', async (req, res) => {
    const { uID, taskID, status } = req.body;

    const std = await StudentModel.findById(uID);

    let stdt = JSON.parse(std.tasks);
    
    for (let i = 0; i < stdt.length; i++) {
      const element = stdt[i];
      
      if (element.id === taskID) {
        element.status = status;
        break;
      }
    }

    std.tasks = JSON.stringify(stdt);
    const resFromDb = await std.save();

    res.json(resFromDb);
  })
  .post('/save/student', async (req, res) => {
    const { name, last_name } = req.body;
    console.log(name, last_name);

    const std = new StudentModel({ name, last_name, tasks: '[]' });
    const nstd = await std.save();
    let resObj = {
      ...nstd
    };

    resObj['hide'] = false;
    resObj.tasks = JSON.parse(nstd.tasks);
    resObj.name = nstd.name;
    resObj.last_name = nstd.last_name;
    resObj._id = nstd._id;

    res.json(resObj);
  })
  .post('/delete/student', async (req, res) => {
    const { stdID } = req.body;

    const resFromDb = await StudentModel.findByIdAndDelete(stdID);
    res.json(resFromDb);
  })