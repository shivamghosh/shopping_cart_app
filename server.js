const express = require('express')
const fs =require('fs')
const app=express()
const mongoose = require('mongoose')
const orderdata = require('./dbmodel/orderdata')

if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripe=require('stripe')(stripeSecretKey)

//connecting to mongoose
mongoose.connect('mongodb://localhost/orderdata', {
  useNewUrlParser: true, useUnifiedTopology: true
});

//template engine
app.set('view engine','ejs');

//middleware
app.use(express.json());

//static files
app.use(express.static('public'));

app.get('/',function(req,res)
{
    fs.readFile('items.json',function(error,data)
    {
        if (error) {
            res.status(500).end()
          }
        else
        {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
              })
        }
    }
)})

app.post('/purchase',function(req,res)
{
    fs.readFile('items.json',function(error,data)
    {
        if (error) {
            res.status(500).end();
          }
        else
        {
            const itemsJson = JSON.parse(data);
      const itemsArray = itemsJson.electronics.concat(itemsJson.clothing).concat(itemsJson.footwear);
      let total = 0;
      req.body.items.forEach(function(item) {
        const itemJson = itemsArray.find(function(i) {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
      })

      //stripe payment
      stripe.charges.create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: 'inr'
      }).then(function() {
        console.log('Payment Successful')
        res.json({ message: 'Successfully purchased items' })
      }).catch(function() {
        console.log('Payment Fail')
        res.status(500).end()
      })

      //inserting the orders into database
      req.body.items.forEach(async function(item)
      {
        await orderdata.create({ id: item.id,quantity: item.quantity });
      })

        }
    }
)})


app.listen(8080,()=>{
  console.log("Listening to port 8080")
})