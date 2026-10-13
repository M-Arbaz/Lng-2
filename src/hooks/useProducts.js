'use client'

import { useState, useEffect } from 'react';
import productsService from '../utils/productsService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsService.getAllProducts();
        // Filter out draft products — they are only visible in admin panel
        const published = data.filter((p) => p.status !== 'draft');
        setProducts(published);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductById = async (id) => {
    try {
      const product = await productsService.getProductById(id);
      return product;
    } catch (err) {
      console.error('Error getting product:', err);
      throw err;
    }
  };

  const getProductsByCategory = async (categoryId) => {
    try {
      const products = await productsService.getProductsByCategory(categoryId);
      return products;
    } catch (err) {
      console.error('Error getting products by category:', err);
      throw err;
    }
  };

  const searchProducts = async (searchTerm) => {
    try {
      const results = await productsService.searchProducts(searchTerm);
      return results;
    } catch (err) {
      console.error('Error searching products:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    getProductById,
    getProductsByCategory,
    searchProducts,
  };
};

export default useProducts;
