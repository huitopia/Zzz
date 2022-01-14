const express = require('express');

const router = express.Router();
const ERROR = require('../data/error');
const authMiddleware = require('../middlewares/auth-middleware');
require('dotenv').config();
const Asmr = require('../schemas/asmr');
const Seed = require('../schemas/seedDb');

// ASMR  category API

router.get('/categories/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const target = await Asmr.find({ categoryIdx: categoryId });
        if (!target) {
            throw new Error(ERROR.NO_EXISTS_DATA);
        }

        data = {
            items: target,
            total: target.length,
        };
        res.json({ msg: 'success', data });
    } catch (err) {
        console.log('err', err);
        res.json({ msg: 'fail' });
    }
});

// ASMR show everything API
router.get('/', async (req, res) => {
    try {
        const target = await Asmr.find({})
            .sort('id')
            .lean();

        if (!target) {
            throw new Error(ERROR.NO_EXISTS_DATA);
        }
        data = {
            items: target,
            total: target.length,
        };
        res.json({ msg: 'success', data });
    } catch (err) {
        console.log('err', err);
        res.json({ msg: 'fail' });
    }
});

// TEST
router.post('/test', async (req, res) => {
    const {
        categoryIdx, categoryName, title, asmrUrl, iconUrl,
    } = req.body;
    console.log('test adding new item ');
    try {
        // const data = {
        //     categoryIdx, categoryName, title, asmrUrl, iconUrl,
        // };
        const newItem = await Asmr.create({
            categoryIdx, categoryName, title, asmrUrl, iconUrl,
        });
        res.status(200).json({
            newItem,
        });
    } catch (error) {
        res.status(401);
    }
});

// seeding the DB
router.get('/seed', async (req, res) => {
    // console.log(Seed)
    Seed.forEach(async (element) => {
        try {
            await Asmr.create({
                categoryIdx: element.categoryIdx,
                categoryName: element.categoryName,
                title: element.title,
                asmrUrl: element.asmrUrl,
                iconUrl: element.iconUrl,
                copyRight: element.copryRight,
            });
        } catch (error) {
            res.status(401);
        }
    });
    res.status(200).json({ isSeeded: 'sucessful' });
});

module.exports = router;
