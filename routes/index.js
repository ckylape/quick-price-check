const express = require('express')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const router = express.Router()

/* GET home page. */
router.get('/', async(req, res) => {
    const adapter = new FileAsync('db.json')
    const db = await low(adapter)
    const items = await db.get('items').sortBy('category').value()

    for (const [index, item] of items.entries()) {
        // check if url exists
        if (!item.best.hasOwnProperty('url')) {
            items[index].best['url'] = ''
        }
        // check if best price exists
        if (!item.best.hasOwnProperty('price')) {
            items[index].best['price'] = 99999999999.99
        }
    }

    res.render('index', {
        title: 'All Products',
        products: items
    })
})

module.exports = router