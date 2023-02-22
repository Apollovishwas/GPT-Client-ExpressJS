var express = require('express');
var router = express.Router();
const Axios = require('axios');
/* GET home page. */
router.get('/', async function(req, res, next) {
    const query = "will+shopify+work+on+desktops%3F"
    const request = await Axios.post(`https://polymathecome.herokuapp.com/?query=${query}`)
    var queryPoly = "Will shopify work on ios?"
    var data = request.data
    
  
  const context = data.bits.map(chunk => chunk.text).join('\n');
  var resContext= `Answer the question as truthfully as possible using the provided context, and if don't have the answer, say in a friendly tone that this Polymath instance does not contain the answer and suggest looking for this information elsewhere.\n\nContext:\n${context} \n\nQuestion:\n${query}\n\nAnswer:`;

  var replyFromAI =  await call_api('completions', {
    model: 'text-davinci-003',
    prompt: resContext,
    max_tokens: 1024,
    temperature: 0,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: '\n'
  });
  var reply = replyFromAI['result']['choices'][0]['text'];
const slackResult = await Axios.post('https://hooks.slack.com/services/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', {
    text : reply,
})


res.json({
    "answer": reply,
});
 
  //creating Query 


})





    async function call_api(type, payload) {
      const url = `https://api.openai.com/v1/${type}`;
      console.log(url);
      const result = await (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,
        },
        body: JSON.stringify(payload)
      })).json();
      if (result.error)
        return {
          error: result.error.message
        }
       
      return {
       result
      };
    }



module.exports = router;
