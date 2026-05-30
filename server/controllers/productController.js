const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product.' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { productName, sku, category, price, stock, minimumStock, monthlySales, warehouseLocation } = req.body;

    if (!productName || !sku || !category || price === undefined) {
      return res.status(400).json({ message: 'Product name, SKU, category, and price are required.' });
    }

    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: 'SKU already exists.' });
    }

    const product = new Product({
      productName,
      sku,
      category,
      price,
      stock: stock || 0,
      minimumStock: minimumStock || 10,
      monthlySales: monthlySales || 0,
      warehouseLocation: warehouseLocation || '',
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product.' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { productName, sku, category, price, stock, minimumStock, monthlySales, warehouseLocation } = req.body;

    // Check if SKU conflicts with another product
    if (sku) {
      const existing = await Product.findOne({ sku, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'SKU already used by another product.' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, sku, category, price, stock, minimumStock, monthlySales, warehouseLocation },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
