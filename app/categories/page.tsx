'use client';

import { useState } from 'react';

import { Category } from '@/lib/api';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/lib/queries';

function CategoryRow({ category }: { category: Category }) {
  const updateCategory = useUpdateCategory();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(String(category.monthly_limit));

  const save = () => {
    const value = parseFloat(limit);
    if (Number.isNaN(value)) return;
    updateCategory.mutate(
      { categoryId: category.category_id, patch: { monthly_limit: value } },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800 first:border-t-0">
      <div>
        <span className="text-sm">{category.name}</span>
        {category.is_betting_category && (
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            betting
          </span>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            className="w-24 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <button className="text-xs text-blue-600 dark:text-blue-400" onClick={save}>
            Save
          </button>
          <button className="text-xs text-gray-400" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200" onClick={() => setEditing(true)}>
          ${category.monthly_limit.toFixed(0)} / mo
        </button>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const categories = useCategories();
  const createCategory = useCreateCategory();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [isBetting, setIsBetting] = useState(false);

  const submit = () => {
    const value = parseFloat(limit);
    if (!name || Number.isNaN(value)) return;
    createCategory.mutate(
      { name, monthly_limit: value, is_betting_category: isBetting },
      {
        onSuccess: () => {
          setName('');
          setLimit('');
          setIsBetting(false);
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Categories</h1>
        <button
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Add category'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
            placeholder="Name (Groceries)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
            placeholder="Monthly limit ($)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isBetting} onChange={(e) => setIsBetting(e.target.checked)} />
            This is the betting category
          </label>
          <button
            className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2"
            onClick={submit}
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? 'Saving...' : 'Save category'}
          </button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        {categories.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {categories.data?.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
        {categories.data?.map((category) => (
          <CategoryRow key={category.category_id} category={category} />
        ))}
      </div>
    </div>
  );
}
