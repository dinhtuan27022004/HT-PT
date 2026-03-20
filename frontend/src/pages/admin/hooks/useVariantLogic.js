import { cartesian } from '../../../utils/cartesian';

export const useVariantLogic = (form, attributes, currentVariants, setVariants) => {
    const generateVariants = (vals) => {
        const optAttrs = attributes.filter(a => a.type === 'option');
        const arrays = optAttrs.map(a => (vals[a.name] || []).map(v => ({ name: a.name, value: v }))).filter(arr => arr.length);

        if (!arrays.length) return setVariants([]);

        const newVariants = cartesian(...arrays).map((combo, i) => {
            const arr = Array.isArray(combo) ? combo : [combo];
            const variantName = arr.map(c => c.value).join(' - ');

            // Find if this variant already exists or can inherit data
            // Priority 1: Exact match of options (e.g. Red-S -> Red-S)
            let existingVariant = currentVariants.find(v => {
                if (v.options.length !== arr.length) return false;
                return v.options.every(opt => arr.some(newOpt => newOpt.name === opt.name && newOpt.value === opt.value));
            });

            // Priority 2: Inheritance (Parent -> Child) - e.g. Red -> Red-S
            // If we added a new attribute, try to find a parent variant that has all the options of the new variant (subset check)
            if (!existingVariant) {
                // Find a variant in currentVariants where ALL of its options exist in the new variant
                // e.g. current: [{name: 'Color', value: 'Red'}], new: [{name: 'Color', value: 'Red'}, {name: 'Size', value: 'S'}]
                // The new variant is a SUPERSET of the old one. The old one is compatible.
                existingVariant = currentVariants.find(v => {
                    // Only consider if the old variant has FEWER options (meaning we added attributes)
                    if (v.options.length >= arr.length) return false;
                    return v.options.every(opt => arr.some(newOpt => newOpt.name === opt.name && newOpt.value === opt.value));
                });
            }

            // Priority 3: Reverse Inheritance (Child -> Parent) - e.g. Red-S -> Red (when Size attribute removed)
            // Not strictly needed for "Add new option" logic, but good for completeness if we want to preserve data when removing attrs.
            // For now, let's focus on the user request: "inherited price when adding option to new attribute"

            if (existingVariant) {
                // Determine if this is a "new option" for an existing attribute
                // e.g. Old: Red-S. New: Red-M.
                // Red-M should NOT inherit from Red-S.
                // The logic above (Priority 2) ensures we only inherit if the old variant is a SUBSET.
                // Since Red-S has {Color: Red, Size: S} and Red-M has {Color: Red, Size: M}, neither is a subset of the other.
                // So Red-M will correctly get price 0.

                return {
                    ...existingVariant,
                    key: `new-${Date.now()}-${i}`, // Always generate new key to avoid React re-render issues with duplicate keys
                    name: variantName,
                    options: arr,
                    sku: `${form.getFieldValue('sku') || 'SKU'}-${arr.map(c => c.value.substring(0, 3).toUpperCase()).join('-')}`
                };
            }

            return {
                key: `new-${Date.now()}-${i}`,
                name: variantName,
                sku: `${form.getFieldValue('sku') || 'SKU'}-${arr.map(c => c.value.substring(0, 3).toUpperCase()).join('-')}`,
                price: 0,
                stock: 0,
                status: 'active',
                options: arr
            };
        });

        setVariants(newVariants);
    };

    const handleVariantChange = (variants, setVariants, key, f, v) => {
        const next = [...variants]; const idx = next.findIndex(vr => vr.key === key);
        if (idx > -1) { next[idx][f] = v; setVariants(next); }
    };

    return { generateVariants, handleVariantChange };
};
