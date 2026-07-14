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
    <div className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
      <div>
        <span className="text-sm">{category.name}</span>
        {category.is_betting_category && (
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-surface text-accent">betting</span>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            className="w-24 rounded-lg border border-border bg-transparent px-2 py-1 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <button
            className="text-xs text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            onClick={save}
          >
            Save
          </button>
          <button
            className="text-xs text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="text-sm text-muted hover:text-foreground font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
          onClick={() => setEditing(true)}
        >
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
          className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Add category'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <input
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            placeholder="Name (Groceries)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            placeholder="Monthly limit ($)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isBetting} onChange={(e) => setIsBetting(e.target.checked)} />
            This is the betting category
          </label>
          <button
            className="w-full rounded-lg bg-primary text-primary-ink text-sm font-medium py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={submit}
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? 'Saving...' : 'Save category'}
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        {categories.isLoading && <p className="text-sm text-muted">Loading...</p>}
        {categories.data?.length === 0 && <p className="text-sm text-muted">No categories yet.</p>}
        {categories.data?.map((category) => (
          <CategoryRow key={category.category_id} category={category} />
        ))}
      </div>
    </div>
  );
}
