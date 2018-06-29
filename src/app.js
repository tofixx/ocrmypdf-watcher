const chokidar = require('chokidar');
const exec = require('child_process').exec;
const config = require('config');
const fs = require('fs');

const DELAY = 10000; // milliseconds

const watcher = chokidar.watch('watch-folder/', {
  ignored: /[\/\\]\./, persistent: true
});

const log = console.log.bind(console);
const processingFiles = {};

function processFile(path){
  processingFiles[path].state = 'started';
  let exportPath = path.replace(/^watch-folder\//, 'export-folder/');
  log(exportPath);
  exec(`ocrmypdf ${config.get('ocrmypdf-options')} ${path} ${exportPath}`,
        (error, stdout, stderr) => {
            log(`${stdout}`);
            log(`${stderr}`);
            if (error !== null) {
                log(`exec error: ${error}`);
            }else{
              fs.unlinkSync(path);
            }
            delete processingFiles.path;
        });
}

function checkFileProcessing(path){
  if(processingFiles[path]){
    if(processingFiles[path].state == 'created'){
      let handle = processingFiles[path];
      clearTimeout(handle.timer);
      handle.timer = setTimeout(function(){ processFile(path) }, DELAY);
    }
  } else {
    processingFiles[path]={
      timer: setTimeout(function(){ processFile(path) }, DELAY),
      state: 'created'
    }
  }
}

function processing (path, stats, event){
  if(path.endsWith('.pdf')){
    if (stats) 
      log('File', path, event, 'changed size to', stats.size);
    else 
      log('File', path, event);
    checkFileProcessing(path);
  }
}


watcher.on('change', function(path,stat) {
    processing(path,stat,'change');
  }).on('add', function(path, stat) {
    processing(path, stat, 'add');
  });
