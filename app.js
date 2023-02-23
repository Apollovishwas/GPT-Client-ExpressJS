


var express = require('express');
require('dotenv').config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var indexRouter = require('./routes/index');



var usersRouter = require('./routes/users');
const Axios = require('axios');
var app = express();
var jsonParser = bodyParser.json()
app.get('/', (req, res) => {
  console.log( );
    res.send('Hello Slackbot!');
  });



// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.post('/shopifai',urlencodedParser,async function(req,res) {
  let stat = 1;
 if(stat ==1) {
  stat = 0;
    const query = encodeURIComponent(req.body.text);
    if(query == '' || query == ' ' || query == undefined) {
      res.json('Invalid Query')
    return;
    }
    else {
    let defaultReply = ['Hmmm..Let me Search', 'Give me a moment to search', 'Good Question. Let me search answer for that', 'Searching my records']
    let datum = {
        respose_type:'in_channel',
        text : JSON.stringify(
        defaultReply[randomIntFromInterval(0,3)]
        )
      };
      
    //   const fetch = require('node-fetch');
    //  await fetch(`https://lionfish-app-n87c6.ondigitalocean.ap`)
    //   .then(function (response) {
    //     console.log(response.status);
       
    // })
    try {
      const response = await fetch('https://lionfish-app-n87c6.ondigitalocean.app');
      console.log('no error', response.status)
      res.json(datum)
      const request = await Axios.post(`https://lionfish-app-n87c6.ondigitalocean.app/?query=${query}`)
    
    var data = request.data
    
  //sending response to slack 
//getting url part
var firstDesc = '';
var secondDesc = '';
if(data.bits[0].info.description != undefined){
 firstDesc = (data.bits[0].info.description).replace(/^[\s\n]+|[\s\n]+$/g,'');
secondDesc = (data.bits[1].info.description).replace(/^[\s\n]+|[\s\n]+$/g,'');
}
else {
firstDesc = 'View Page';
secondDesc = 'View Page'
}



    
var firstLink = data.bits[0].info.url
var secondLink = (data.bits[1].info.url);
firstLink = firstLink.replace(/^[\s\n]+|[\s\n]+$/g,'');
secondLink = (secondLink.replace(/^[\s\n]+|[\s\n]+$/g,''));
    const context = data.bits.map(chunk => chunk.text).join('\n');
    var resContext= `Answer the question as truthfully as possible using the provided context, and if don't have the answer, say in a friendly tone that this Polymath instance does not contain the answer and suggest looking for this information elsewhere.\n\nContext:\n${context} \n\nQuestion:\n${query}\n\nAnswer:`;
   const payload = {
    model: 'text-davinci-003',
    prompt: resContext,
    max_tokens: 1024,
    temperature: 0,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: '/n'
   }
   
   const url = `https://api.openai.com/v1/completions`;
      
      const result = await (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload)
      })).json();


      if (result.error) {
        console.log(
            "Error occured. Try again!"
        )
      }
      else {
        var reply = result['choices'][0]['text'];
        //if two resources are same, 
        if (firstLink==secondLink) {
        

          const slackResult = await Axios.post(process.env.WEBHOOK, {
            'blocks':[
              {
                "type": "section",
			          "text": {
				        "type":"plain_text",
				        "text": reply + '. This resource might help you! ',
				"emoji": true
			}
              }, 
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<"+firstLink+"|"+firstDesc+" >"
                }
              }
            ]
        })

        //else
        }
        else {
          const slackResult = await Axios.post(process.env.WEBHOOK, {
            'blocks':[
              {
                "type": "section",
			          "text": {
				        "type":"plain_text",
				        "text": reply + '. This resource might help you! ',
				"emoji": true
			}
              }, 
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<"+firstLink+"|"+firstDesc+" >"
                }
              }, 
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<"+secondLink+"|"+secondDesc+" >"
                }
              }
            ]
        })

        }
        
      

        stat = 1
     }


    } catch (error) {
      // TypeError: Failed to fetch
      res.json('Polymath Server Offline')
      console.log('There was an error', error);
    }

  

    
       
    
    }
  }
})


app.post('/ai',urlencodedParser,async function(req,res) {
  let aiStat = 1;
  if(aiStat == 1) {
    aiStat = 0;
  const query = encodeURIComponent(req.body.text);
  if(query == '' || query == ' ' || query == undefined) {
    res.json('Invalid query');
  return;
  }
  else {
  const payloads = {
    model: 'text-davinci-003',
    prompt: query,
    max_tokens: 1024,
    temperature: 0,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: '#'
   }
   let defaultReply = ['Hmmm..Let me Search', 'Give me a moment to search', 'Good Question. Let me search answer for that', 'Searching my records']


   let datum = {
    respose_type:'in_channel',
    text : JSON.stringify(
    defaultReply[randomIntFromInterval(0,3)] 
    )
  };
  res.json(datum);
 
   const url = `https://api.openai.com/v1/completions`;
   const fetch = require('node-fetch');

      const result = await (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payloads)
      })).json();
      if (result.error) {
        console.log(result)
        res.json(result.error)
        const slackResult = await Axios.post(process.env.WEBHOOK, {
          text : "Error. Try again",
      })
      }
       
     else {
      console.log("no errir")
      console.log(result['choices'])
        var reply = result['choices'][0]['text'];
        
        
        const slackResult = await Axios.post(process.env.WEBHOOK, {
            text : reply,
        })
        aiStat = 1;
     }
    }
  }
})


// async function fallBackAi(query) {
//   //const query = encodeURIComponent(req.body.text);
//   const payload = {
//     model: 'text-davinci-003',
//     prompt: query,
//     max_tokens: 1024,
//     temperature: 0,
//     top_p: 1,
//     n: 1,
//     stream: false,
//     logprobs: null,
//     stop: '\n'
//    }

//    let datum = {
//     respose_type:'in_channel',
//     text : JSON.stringify(
//     "openai is processing your query" 
//     )
//   };
//   res.json(datum);
//    const url = `https://api.openai.com/v1/completions`;
      
//       const result = await (await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer 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`,
//         },
//         body: JSON.stringify(payload)
//       })).json();
//       if (result.error) {
//         const slackResult = await Axios.post('https://hooks.slack.com/services/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', {
//           text : "Error. Try again",
//       })
//       }
       
//      else {
//         var reply = result['choices'][0]['text'];
        
//         const slackResult = await Axios.post('https://hooks.slack.com/services/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', {
//             text : reply,
//         })
//      }
//}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"))

app.use('/', indexRouter);

app.use('/users', usersRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App available at http://localhost:${port}`);
  });
module.exports = app;


//Random Function
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}