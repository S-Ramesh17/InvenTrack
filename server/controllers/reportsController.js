const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// GET /api/reports/movements
const getMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate('productId', 'productName sku')
      .sort({ date: -1 })
      .limit(100); // Limit to last 100 movements

    res.status(200).json(movements);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ message: 'Error fetching stock movements.' });
  }
};

// GET /api/reports/summary
const getSummary = async (req, res) => {
  try {
    const products = await Product.find();

    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, p) => sum + p.stock, 0);
    const criticalStock = products.filter((p) => p.stock > 0 && p.stock < p.minimumStock);
    const outOfStock = products.filter((p) => p.stock === 0);
    const lowStock = products.filter(
      (p) => p.stock >= p.minimumStock && p.stock < p.minimumStock + 20
    );
    const fastMoving = products.filter((p) => p.monthlySales > 100);

    // Today's movements count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMovements = await StockMovement.countDocuments({ date: { $gte: today } });

    res.status(200).json({
      totalProducts,
      totalInventory,
      criticalStock: criticalStock.length,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      fastMoving: fastMoving.length,
      todayMovements,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Error fetching summary.' });
  }
};

module.exports = { getMovements, getSummary };
