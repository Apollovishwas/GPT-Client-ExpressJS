# GPT3-SlackBot-ExpressJS


### Overview Of how this app works.

This App recieves POST request from slack, parses the query, send to python API to get all related content. Then uses the content to 
Construct a prompt and send the prompt to OpenAI API, returns response back to slack


### Step 1 : Recieves POST request 

App recieves POST request in Two Paths

```
app.post('/shopifai'...     (This Request process input with polymath Library and openAI API)
```
```
app.post('/ai'...     (This Request process input with just openAI API)
```

### Step 2 : Posting Response To Slack Channel

Slack Bot expects response within 3 seconds. Since we are using openAI API, there's no promise, 
We'll get response within 3 seconds, everytime. To avoid time out, We are posting proxy reponse 
to the slack bot.

```
 let datum = {
        respose_type:'in_channel',
        text : JSON.stringify(
        "Hmm..Let me Search."
        )
      };
      
      
      res.json(datum)
      
  ```
  
 ### Step 3 : Requesting Polymath API for Context
 
 We are now requesting polymath Python API with user's query from slack 
 
 ```
 const request = await Axios.post(`https://polymathecome.herokuapp.com/?query=${query}`)
 ```
 
 We'll use the reponse and construct a prompt to send to openAI API
 
 ### Step 4 : Requesting OpenAI API for response.
 
 To request openAI API, We need a payload to send i.e
 
 ```
  const payload = {
    model: 'text-davinci-003',
    prompt: <Your Constructed Context>,
    max_tokens: 1024,
    temperature: 0,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: '/n'
   }
 ```
 
 Now we are ready to request openAI API for response 
 
 ```
 const result = await (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer <your openai API Key>`,
        },
        body: JSON.stringify(payload)
      })).json();
  ```
  
 ### Step 5 : Posting Reponse to slack Bot Channel 
 
 ```
 var reply = result['choices'][0]['text'];
        
const slackResult = await Axios.post('your Slack webhook URL', {
            text : reply,
        })
 ```
