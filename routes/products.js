const express = require('express')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const shortid = require('shortid')
const router = express.Router()

router.get('/add', (req, res, next) => {
  res.render('products/add', { title: 'Add New Product' })
})

router.post('/add', async (req, res) => {
  try {
    const adapter = new FileAsync('db.json')
    const db = await low(adapter)
    const item = {
      name: req.body.name,
      category: req.body.category,
      alert: parseFloat(req.body.price).toFixed(2),
      urls: [],
      id: shortid.generate(),
      best: {}
    }

    for(const url of req.body.urls) {
      item.urls.push(url.href)
    }

    // check if the product name already has been added
    const search = await db.get('items').find({ name: item.name }).value()
    if(search) {
      req.flash('info', search.name + ' has already been added to the Price Watch list.')
      res.redirect('/products/add')
    } else {
      await db.get('items')
        .push(item)
        .write()

      req.flash('success', item.name + ' has been successfully added.')
      res.redirect('/')
    }

  } catch (err) {
    console.log(err)
    req.flash('error', 'An error has occured when attempting to add the product!')
    res.redirect('/')
  }
})

router.get('/delete/:id', async (req, res, next) =>{
  const adapter = new FileAsync('db.json')
  const db = await low(adapter)
  const item = await db.get('items').find({ id: req.params.id }).value()

  if(item) {
    res.render('products/delete', { title: 'Delete ' + item.name, item: item })
  } else {
    req.flash('error', 'That product does not exist. Stop it!')
    res.redirect('/')
  }
})

router.post('/delete', async (req, res, next) =>{
  const adapter = new FileAsync('db.json')
  const db = await low(adapter)
  const check = await db.get('items')
    .remove({ id: req.body.id })
    .write()

  if(check) {
    req.flash('success', req.body.id + ' has been successfully deleted!')
    res.redirect('/')
  } else {
    req.flash('error', 'That product does not exist. Stop it!')
    res.redirect('/')
  }

})

router.get('/edit/:id', async (req, res, next) =>{
  const adapter = new FileAsync('db.json')
  const db = await low(adapter)
  const item = await db.get('items').find({ id: req.params.id }).value()

  if(item) {
    res.render('products/edit', { title: 'Edit ' + item.name, item: item })
  } else {
    req.flash('error', 'That product does not exist. Stop it!')
    res.redirect('/')
  }
})

router.post('/edit', async (req, res, next) =>{
  const adapter = new FileAsync('db.json')
  const db = await low(adapter)
  const item = {
    name: req.body.name,
    category: req.body.category,
    alert: parseFloat(req.body.price).toFixed(2),
    urls: [],
    id: req.body.id
  }
  for(const url of req.body.urls) {
    item.urls.push(url.href)
  }
  const check = await db.get('items')
    .find({ id: req.body.id })
    .assign(item)
    .write()

  if(check) {
    req.flash('success', item.name + ' has been successfully edited!')
    res.redirect('/')
  } else {
    req.flash('error', 'That product does not exist. Stop it!')
    res.redirect('/')
  }

})


module.exports = router
