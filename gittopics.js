let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let PDFDocument= require('pdfkit');
let url = "https://github.com/topics";
request(url, cb);
function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        // console.log(html);
        extractData(html);
    }
}
function extractData(html) {
    let selTool = cheerio.load(html);
    let anchors = selTool
        (".no-underline.d-flex.flex-column.flex-justify-center");
    for (let i = 0; i < anchors.length; i++) {
        let link = selTool(anchors[i]).attr("href");
        // console.log(link);
        let fullLink = "https://github.com" + link;
        extractRepodata(fullLink)
    }
}
function extractRepodata(fullLink) {
    request(fullLink, cb);
    function cb(err, response, html) {
        if (err) {
            console.log(err);
        } else {
            getRepoLinks(html);
        }
    }
}
function getRepoLinks(html) {
    let selTool = cheerio.load(html);
    let topicNameElem = selTool(".h1-mktg");
    let repolinks = selTool("a.text-bold");
    //console.log(topicNameElem.text());
    let topicName = topicNameElem.text().trim();
    dirCreater(topicName);
    for (let i = 0; i < 8; i++) {
        let repoPageLink = selTool(repolinks[i]).attr("href");
        let repoName = repoPageLink.split("/").pop();
        repoName = repoName.trim();
        //console.log(repoName);
        //createFile(repoName, topicName);
        let fullRepoLink= "https://github.com" + repoPageLink + "/issues";
        getIssues(repoName, topicName, fullRepoLink);
    }
    console.log("`````````````````````````");
}

function getIssues(repoName, topicName, repoPageLink){
    request(repoPageLink, cb);
    function cb(err, resp, html){
        if(err){
            if(resp.statusCode== 404){
                console.log(err);
            }
            else{
                console.log(err);
            }
        }
        else{
            extractissues(html, repoName, topicName);
        }
    }
}

function extractissues(html, repoName, topicName){
    let seltool= cheerio.load(html);
    let issuesanchr= seltool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let arr=[];
    for(let i=0; i<issuesanchr.length; i++){
        let name=seltool(issuesanchr[i]).text();
        let link=seltool(issuesanchr[i]).attr("href");
        arr.push({
            "Name":name,
            "Link": "https://github.com"+link
        })
    }
    let filepath=path.join(__dirname, topicName, repoName + ".pdf");
    let pdfdoc=new PDFDocument;
    pdfdoc.pipe(fs.createWriteStream(filepath));
    pdfdoc.text(JSON.stringify(arr));
    pdfdoc.end();
}
function dirCreater(topicName) {
    let pathOfFolder = path.join(__dirname, topicName);
    if (fs.existsSync(pathOfFolder) == false) {
        fs.mkdirSync(pathOfFolder);
    }
}

function createFile(repoName, topicName) {
    let pathofFile = path.join(__dirname, topicName, repoName + ".json");
    if (fs.existsSync(pathofFile) == false) {
        let createStream = fs.createWriteStream(pathofFile);
        createStream.end();
    }
}
