const express = require("express");
const { identity } = require("lodash");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51LYOZnSED7zxlOa8JJRGqPgogYBn0hw5geNTfpbNBlxT6JXyyUtU14QyB2qv1EZAwvC0Fw3NjugyNkk3zINBj2xh00pqSKN7nc"
);

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 20000;
};

router.get("/", (req, res) => res.send(" Payment Route"));

router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    customer:'cus_MIciUgEizHmKkS',
    metadata: {
        order_id: '6735',
      },
      description:"Paying in USD"
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;
