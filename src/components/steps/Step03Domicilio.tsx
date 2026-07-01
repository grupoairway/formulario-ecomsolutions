'use client';

import { FormData } from '@/lib/types';
import { LocalDomicilioForm } from './DireccionForm';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

export default function Step03Domicilio({ formData, onChange, errors }: Props) {
  return (
    <LocalDomicilioForm
      data={formData.domicilio}
      onChange={(updates) => onChange({ domicilio: { ...formData.domicilio, ...updates } })}
      prefix="dom_"
      errors={errors}
    />
  );
}
