const express = require("express");
const { isLoggedIn } = require('../middleware');
const router = express.Router();
const Order = require("../models/order");
const User = require("../models/user");
const Cart = require("../models/cart");
const { v4: uuidv4 } = require("uuid");

const checksum_lib = require('../payTM/checksum/checksum');
const config = require("../payTM/checksum/config");

router.post("/pay", isLoggedIn, async(req, res) => {
  // Route for making payment
  // console.log(req.user);

  const user = req.user;
  user.address = req.body.address;
  user.phoneNumber = req.body.phone;
  await user.save();

  var paymentDetails = {
    amount: req.body.amount.trim(),
    customerId: uuidv4(),
    customerEmail: req.body.email,
    customerPhone: req.body.phone,
  };
  if (
    !paymentDetails.amount ||
    !paymentDetails.customerId ||
    !paymentDetails.customerEmail ||
    !paymentDetails.customerPhone
  ) {
    res.status(400).send("Payment failed");
  } else {
    var params = {};
    params["MID"] = config.PaytmConfig.mid;
    params["WEBSITE"] = config.PaytmConfig.website;
    params["CHANNEL_ID"] = "WEB";
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["ORDER_ID"] = "TEST_" + new Date().getTime();
    params["CUST_ID"] = paymentDetails.customerId;
    params["TXN_AMOUNT"] = paymentDetails.amount;
    params["CALLBACK_URL"] = "http://localhost:3000/payment/success";
    params["EMAIL"] = paymentDetails.customerEmail;
    params["MOBILE_NO"] = paymentDetails.customerPhone;

    // console.log(params);
    checksum_lib.genchecksum(
      params,
      config.PaytmConfig.key,
      function (err, checksum) {
        var txn_url =
          "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
          form_fields +=
            "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields +=
          "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
          '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
            txn_url +
            '" name="f1">' +
            form_fields +
            '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
        );
        console.log("redirect to callback");
        res.end();
      }
    );
  }
});

router.post("/payment/success", isLoggedIn, async (req, res) => {
  try {
    var body = req.body;

    const order = {
      txnid: req.body.TXNID,
      orderid: req.body.ORDERID,
      amount: req.body.TXNAMOUNT,
      orderedProducts: req.user.cart
    };

    console.log(order);

    const placedOrder = await Order.create(order);

    console.log(placedOrder);

    req.user.orders.push(placedOrder);

    const user = req.user;
    const userid = req.user._id;
    const cartid = req.user.cart;
    console.log(cartid);

    const product = await Cart.findById(order.orderedProducts);

    console.log(product);

    await User.findOneAndUpdate(
      { _id: userid },
      {
        $pullAll: { cart: cartid },
      }
    );

    await user.save();

    req.flash("success", "Your Order has been placed successfully");
    
    res.redirect('/meals');
  } catch (error) {
    console.log(error);
    res.render("payment/failed", { payment: req.body });
  }
});



module.exports = router;
