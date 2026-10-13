'use client'

import { useState, useEffect } from 'react';
import categoriesService from '../utils/categoriesService.js';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoriesService.getAllCategories();
        // Only include active categories for the website
        const activeCategories = data.filter((c) => c.isActive !== false);
        // Map to the shape expected by website components
        const mapped = activeCategories.map((c) => ({
          id: c.name,
          firestoreId: c.id,
          title: c.name,
          description: c.description || '',
          image: c.image || '',
        }));
        setCategories(mapped);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useCategories;
