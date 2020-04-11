const express = require('express');
const rimraf = require("rimraf");
const app = express();
const fs = require('fs');
const chalk = require('chalk');
const port = 7800;
const staticdDir = 'practice';
app.fileRawData = null;

const validateUserData = (data)=>{
    
    if(data && data.userName && data.name ){
      return true;
    }

    return false;
 };

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

app.get('/api/user',(req,res)=>{
 let idData = fs.readFileSync(`${__dirname}/id.fracto`,{encoding:'utf8'});
 idData = JSON.parse(idData)
 res.json(idData);
 
});

app.delete('/api/del/:file',(req,res)=>{
    const path = `${__dirname}/practice/${req.params.file}`;
    rimraf(path,()=>{
        res.json({path});
    });
    
});

app.get('/api/style',(req,res)=>{
    res.sendFile(__dirname+'/app/common.css');
});

app.post('/api/name/set/:val',(req,res)=>{
    const content = JSON.stringify({name:req.params.val,userName:req.params.val});
    fs.writeFileSync(`${__dirname}/id.fracto`,content);
    res.json({});
});

app.get('/',(req,res)=>{  

      
    fs.readFile(__dirname+'/id.fracto','utf8',(error,data)=>{
        let dataObj=null;
        let signal=false;
        if(error){
            console.log(chalk.red('Error'));
            res.sendFile(__dirname+'/app/login.html')
        }else{
            try{
                dataObj = JSON.parse(data) 
                signal = validateUserData(dataObj);
            }catch(e){
                signal=false;
            }
            
            if(signal){
                res.sendFile(__dirname+'/app/index.html');
            }else{

                
                res.sendFile(__dirname+'/app/login.html')  
            }
        }
        
    })
        
});

app.get('/api/smile',(req,res)=>{
    res.sendFile(`${__dirname}/app/icon.face.svg`);
})


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
