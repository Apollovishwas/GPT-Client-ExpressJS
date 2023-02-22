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
    res.send('Hello World!');
  });
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.post('/shopifai',urlencodedParser,async function(req,res) {
 
    const query = encodeURIComponent(req.body.text);
    let datum = {
        respose_type:'in_channel',
        text : JSON.stringify(
        "Hmm..Let me Search."
        )
      };
      res.json(datum)
    const request = await Axios.post(`https://lionfish-app-n87c6.ondigitalocean.app/?query=${query}`)
    
    var data = request.data
    
  //sending response to slack 

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
        
        const slackResult = await Axios.post(process.env.WEBHOOK, {
            text : reply,
        })
     }


})


app.post('/ai',urlencodedParser,async function(req,res) {
  const query = encodeURIComponent(req.body.text);
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

   let datum = {
    respose_type:'in_channel',
    text : JSON.stringify(
    "Let me process that" 
    )
  };
  res.json(datum);
 
   const url = `https://api.openai.com/v1/completions`;
      
      const result =  (await fetch(url, {
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
        var reply = result['choices'][0]['text'];
        console.log(result)
        
        const slackResult = await Axios.post(process.env.WEBHOOK, {
            text : reply,
        })
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
