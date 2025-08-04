const express = require('express');
const router = express.Router();

module.exports = (models, authenticateToken) => {
  const { Category } = models;

  router.get('/categories', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const categories = await Category.findAll({
        where: { UserId: userId },
        order: [['name', 'ASC']]
      });
      res.json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
    }
  });

  router.post('/categories', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, type, color, description } = req.body;

      
      if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
      }

      
      const existingCategory = await Category.findOne({
        where: { 
          name: name,
          UserId: userId 
        }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }

      
      const category = await Category.create({
        name,
        type,
        color: color || '#1976d2',
        description: description || '',
        UserId: userId
      });

      res.status(201).json(category);
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ message: 'Failed to create category', error: err.message });
    }
  });

  router.put('/categories/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;
      const { name, type, color, description } = req.body;

      
      const category = await Category.findOne({
        where: { 
          id: categoryId,
          UserId: userId 
        }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
          where: { 
            name: name,
            UserId: userId,
            id: { [models.Sequelize.Op.ne]: categoryId }
          }
        });

        if (existingCategory) {
          return res.status(400).json({ message: 'A category with this name already exists' });
        }
      }

      
      await category.update({
        name: name || category.name,
        type: type || category.type,
        color: color || category.color,
        description: description !== undefined ? description : category.description
      });

      res.json(category);
    } catch (err) {
      console.error('Error updating category:', err);
      res.status(500).json({ message: 'Failed to update category', error: err.message });
    }
  });

  router.delete('/categories/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;

      
      const category = await Category.findOne({
        where: { 
          id: categoryId,
          UserId: userId 
        }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      await category.destroy();

      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error('Error deleting category:', err);
      res.status(500).json({ message: 'Failed to delete category', error: err.message });
    }
  });

  return router;
}; 