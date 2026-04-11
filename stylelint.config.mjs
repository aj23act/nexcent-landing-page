/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard"],
    rules: {
        "declaration-property-value-no-unknown": true,
        "property-no-unknown": true,
        "unit-no-unknown": true,
        "color-no-invalid-hex": true,
        "block-no-empty": true,
        "no-duplicate-selectors": true,
        
        // Отключаем строгую проверку kebab-case, чтобы разрешить БЭМ (-- и __)
        "selector-class-pattern": null
    }
};