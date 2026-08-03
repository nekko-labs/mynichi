import { useState } from 'react';
import type { ListCategory, PracticeList } from '@mynichi/core';

import { validateListName, type Validation } from '../lib/validation';
import { createList } from '../store/lists';

// Creating a list happens in two places (the Lists screen and the picker that
// appears wherever a word can be saved). Both used to keep their own useState
// trio and their own idea of what a valid name is; this is that logic, once.

export type ListForm = {
  name: string;
  setName: (value: string) => void;
  category: ListCategory;
  setCategory: (value: ListCategory) => void;
  /** Only set once the user has tried to submit: fields stay quiet while typing. */
  error: Validation;
  canSubmit: boolean;
  /** Creates the list, or returns undefined and surfaces the error. */
  submit: () => PracticeList | undefined;
  reset: () => void;
};

export function useListForm(initialCategory: ListCategory = 'life'): ListForm {
  const [name, setNameValue] = useState('');
  const [category, setCategory] = useState<ListCategory>(initialCategory);
  const [error, setError] = useState<Validation>(null);

  function setName(value: string) {
    setNameValue(value);
    if (error) setError(validateListName(value));
  }

  function reset() {
    setNameValue('');
    setError(null);
  }

  function submit(): PracticeList | undefined {
    const problem = validateListName(name);
    setError(problem);
    if (problem) return undefined;
    const list = createList(name, category);
    reset();
    return list;
  }

  return {
    name,
    setName,
    category,
    setCategory,
    error,
    canSubmit: name.trim().length > 0,
    submit,
    reset
  };
}
