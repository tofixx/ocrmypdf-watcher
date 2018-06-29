Run the filewatcher using 

```docker run -v "/application/watch-folder" -v "/application/export-folder" -it tobiasw/ocrmypdf-watcher```

Files added to watch-folder will be processed after 10 seconds and output to export folder with ocr information added.
