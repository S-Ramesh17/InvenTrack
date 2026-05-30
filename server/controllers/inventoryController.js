const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// POST /api/inventory/stock-in
const stockIn = async (req, res) => {
  try {
    const { productId, quantity, remarks } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and a positive quantity are required.' });
    }

    // Find product and update stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.stock += Number(quantity);
    await product.save();

    // Record stock movement
    const movement = new StockMovement({
      productId,
      movementType: 'IN',
      quantity: Number(quantity),
      remarks: remarks || '',
      performedBy: req.user.name,
    });

    await movement.save();

    res.status(200).json({
      message: `Stock In successful. Added ${quantity} units to ${product.productName}.`,
      product,
      movement,
    });
  } catch (error) {
    console.error('Stock In error:', error);
    res.status(500).json({ message: 'Error processing stock in.' });
  }
};

// POST /api/inventory/stock-out
const stockOut = async (req, res) => {
  try {
    const { productId, quantity, remarks } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and a positive quantity are required.' });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if enough stock
    if (product.stock < Number(quantity)) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    product.stock -= Number(quantity);
    await product.save();

    // Record stock movement
    const movement = new StockMovement({
      productId,
      movementType: 'OUT',
      quantity: Number(quantity),
      remarks: remarks || '',
      performedBy: req.user.name,
    });

    await movement.save();

    res.status(200).json({
      message: `Stock Out successful. Removed ${quantity} units from ${product.productName}.`,
      product,
      movement,
    });
  } catch (error) {
    console.error('Stock Out error:', error);
    res.status(500).json({ message: 'Error processing stock out.' });
  }
};

module.exports = { stockIn, stockOut };
