const express = require('express');
const mysql = require('mysql'); //npm install mysql
const path = require('path');
const static = require('serve-static'); // top root = server.js
const dbconfig = require('./config/dbconfig.json');

//Database connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false
});

const app = express();
app.use(express.urlencoded({extended:true})); // url encode extend
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

app.post('/process/adduser', (req, res)=> {
  console.log('/process/adduser 호출됨 ' + req); //req = name id age password

  const paramId = req.body.id;
  const paramName = req.body.name;
  const paramAge = req.body.age;
  const paramPassword = req.body.password;

  pool.getConnection((err, conn) => {
    
    if(err) {
      conn.release();
      console.log('Mysql getConnection error. aborted');
      res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'})
      res.write("<h1>DB서버 연결실패</h1>");
      res.end();
      return;
    }

    console.log('데이터베이스 연결됨');

    const exec = conn.query('insert into users (id, name, age, password) values (?,?,?,password(?));',
                [paramId, paramName, paramAge, paramPassword],
                (err, result)=>{
                    conn.release();
                    console.log('실행된 SQL: ' + exec.sql)

                    if (err) {
                      console.log('SQL 실행 시 오류 발생');
                      console.dir(err);
                      res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'})
                      res.write("<h1>SQL query 실행 실패</h1>");
                      res.end();
                      return;
                    }

                    if (result) {
                      console.dir(result);
                      console.log('Inserted 성공');

                      res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'})
                      res.write("<h2>회원가입 성공</h2>");
                      res.end();
                    }
                    else {
                      console.log('Inserted 실패');

                      res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'})
                      res.write("<h1>회원가입 실패</h1>");
                      res.end();
                    }
                }
    )
    
  })
});

app.listen(3000, ()=> {
  console.log('Listening on port 3000');
});

