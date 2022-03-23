//import express
const express = require("express");
const app = express();
app.use(express.json());

//import model
const models = require("../models/index");
const pembayaran = models.transaksi;

app.get("/", async (req, res) => {
  let result = await pembayaran.findAll({
    include: [
      "admin",
      {
        model: models.detail_transaksi,
        as: "detail_transaksi",
        include: ["product"],
      },
    ],
  });
  res.json(result);
});

app.get("/:customer_id", async (req, res) => {
  let param = { customer_id: req.params.customer_id };
  let result = await transaksi.findAll({
    where: param,
    include: [
      "customer",
      {
        model: models.detail_transaksi,
        as: "detail_transaksi",
        include: ["product"],
      },
    ],
  });
  res.json(result);
});

app.post("/", async (req, res) => {
  let current = new Date().toISOString().split("T")[0];
  let data = {
    customer_id: req.body.customer_id,
    waktu: current,
  };
  transaksi
    .create(data)
    .then((result) => {
      let lastID = result.transaksi_id;
      detail = req.body.detail_transaksi;
      detail.forEach((element) => {
        element.transaksi_id = lastID;
      });
      for (let i = 0; i < detail.length; i++) {
        //UPDATE STOCK PRODUCT
        let idProduct = { product_id: detail[i].product_id };
        product
          .findOne({ where: idProduct })
          .then((result) => {
            let CurrStock = result.stock;
            let newStock = { stock: CurrStock - detail[i].qty };
            product.update(newStock, { where: idProduct });
          })
          .catch((error) => {
            res.json({
              message: error.message,
            });
          });
      }
      detail_transaksi
        .bulkCreate(detail, { individualHooks: true })
        .then((result) => {
          res.json({
            message: "Data has been inserted",
          });
        })
        .catch((error) => {
          res.json({
            message: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error.message);
    });
});

app.delete("/:transaksi_id", async (req, res) => {
  let param = { transaksi_id: req.params.transaksi_id };
  try {
    await detail_transaksi.destroy({ where: param });
    await transaksi.destroy({ where: param });
    res.json({
      message: "data has been deleted",
    });
  } catch (error) {
    res.json({
      message: error,
    });
  }
});

module.exports = app;