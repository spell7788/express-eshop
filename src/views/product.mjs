import fs from 'fs'
import util from 'util'
import { Product } from '../models/index.mjs'
import { PRODUCT_COLORS, PRODUCT_SIZES } from '../models/product.mjs'
import Upload from '../upload.mjs'

const upload = Upload.single('image')

export const addProduct = {
  async get (req, res) {
    if (!req.user) return res.redirect('/')
    res.render(
      'product/add',
      { req, pageTitle: 'Add product', PRODUCT_COLORS, PRODUCT_SIZES }
    )
  },

  post (req, res) {
    upload(req, res, error => {
      const context = { req, pageTitle: 'Add product', PRODUCT_COLORS, PRODUCT_SIZES }
      if (error) {
        return res.render('product/add', context)
      }

      const imagePath = req.file.path
      console.log('Image path: "%s"', imagePath)

      const productData = { ...req.body, imagePath, ownerId: req.user.id }
      console.log(`Product data: "${util.inspect(productData)}"`)
      Product.create(productData)
        .then(product => {
          console.log(`Product "${util.inspect(product)}" has been created.`)
          res.redirect('/')
        })
        .catch(error => {
          console.error(error)
          fs.unlink(imagePath, err => {
            if (err) throw err
            console.log(`"${util.inspect(imagePath)}" has been deleted.`)
          })

          res.render(
            'product/add',
            { ...context, errors: error.errors.map(e => e.message) }
          )
        })
    })
  }
}