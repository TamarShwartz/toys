const express = require("express");
const { auth } = require("../middlewares/auth");
const {ToyModel,validateToy} = require("../models/ToyModel.js")
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let data = await ToyModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
//toysByPrice
router.get("/prices", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "price"
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let minP = req.query.min;
        let maxP = req.query.max;
        if (minP && maxP) {
            let data = await ToyModel.find({ $and: [{ price: { $gte: minP } }, { price: { $lte: maxP } }] })

                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ [sort]: reverse })
            res.json(data);
        }
        else if (maxP) {
            let data = await ToyModel.find({ price: { $lte: maxP } })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ [sort]: reverse })
            res.json(data);
        } else if (minP) {
            let data = await ToyModel.find({ price: { $gte: minP } })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ [sort]: reverse })
            res.json(data);
        } else {
            let data = await ToyModel.find({})
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ [sort]: reverse })
            res.json(data);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
// /toys/?s=
router.get("/search", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
//toyByCategory
router.get("/category/:catName", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let catN = req.params.catName;
        let catReg = new RegExp(catN, "i")
        let data = await ToyModel.find({ category: catReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.post("/", auth,async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        
        toy.user_id = req.tokenData.user_id;
        // console.log(req.tokenData);
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
//editToy
router.put("/:editId", auth,  async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        console.log(req.tokenData.role);
        if (req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: editId }, req.body)
        }
        else {
            console.log(req.tokenData.user_id);
            data = await ToyModel.updateOne({ _id: editId, user_id: req.tokenData.user_id }, req.body)
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
//deleteToy
router.delete("/:delId", auth, async (req, res) => {
    try {
        let delId = req.params.delId;
        console.log(delId);
        let data;
        console.log(req.tokenData.role);
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: delId })
        }
        else {
            data = await ToyModel.deleteOne({ _id: delId, user_id: req.tokenData.user_id })
            console.log(req.tokenData.user_id);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

module.exports = router;