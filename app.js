const express = require('express');
const rimraf = require("rimraf");
const app = express();
const fs = require('fs');
const chalk = require('chalk');
const port = 7800;
const staticdDir = 'practice';
app.fileRawData = null;
const getContent = ()=>{
    app.fileRawData = fs.readFileSync('./content.fracto',{encoding:'utf8'});
    fs.stat(`${__dirname}/${staticdDir}`,(error,stat)=>{
        if(error){
            console.log(chalk.blue(`creating ${__dirname}/${staticdDir}`));
            fs.mkdirSync(`${__dirname}/${staticdDir}`);
            console.log('Done!');
        }else{
            console.log(chalk.yellow(`${__dirname}/${staticdDir}`));
        }
    });
};

const getUpdatedList = ()=>{
  const dataArr=[];  
  const list= fs.readdirSync(`${__dirname}/${staticdDir}`);
  list.forEach((el,i)=>{
      const status  = fs.statSync(`${__dirname}/${staticdDir}/${el}`);
      
      dataArr.push({dir:el,birthtime:status.birthtime,isDir:status.isDirectory()});
      
  })
  return dataArr;
};



app.use('/practice',express.static('practice'));

app.get('/images/icon',(req,res)=>{
    res.sendFile(`${__dirname}/app/icon.png`);
});

app.delete('/api/del/:file',(req,res)=>{
    const path = `${__dirname}/practice/${req.params.file}`;
    rimraf(path,()=>{
        res.json({path});
    });
    
});

app.get('/',(req,res)=>{    
    res.sendFile(__dirname+'/app/index.html');    
});



app.get('/api/list',(req,res)=>{
    res.json({success:true, list: getUpdatedList()});
});

app.post('/api/create/:dirName',(req,res)=>{
    let str = app.fileRawData;
    const path = `${__dirname}/${staticdDir}/${req.params.dirName}`;
    fs.mkdirSync(path);
    str = str.split('[TITLE]').join(req.params.dirName);
    
    const arr = str.split('SEPARATOR');
    fs.writeFileSync(`${path}/index.html`,arr[0]);
    fs.writeFileSync(`${path}/app.js`,arr[1]);
    res.json({success:true, list: getUpdatedList()});

});

app.listen(port,()=>{
    const t = chalk.magenta(`Application started at `)+chalk.blue(`http://localhost:${port}`);
    getContent();
    console.log(t);
});
