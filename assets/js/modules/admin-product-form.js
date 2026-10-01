"use strict";

/* =========================================================
   KYNEX - FORMULARIO ADMIN PRODUCTOS
========================================================= */

import {
    getProducts,
    getProductById,
    saveProducts
} from "./product-storage.js";


import {
    showFieldError,
    showFieldSuccess
} from "./validation.js";


/* =========================================================
   URL / MODO EDICIÓN
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const editingId =
    Number(
        params.get("id")
    );


const isEditing =
    Number.isInteger(editingId)
    &&
    editingId > 0;


/* =========================================================
   FORMULARIO
========================================================= */

const form =
    document.getElementById(
        "admin-product-form"
    );


const fields = {

    code:
        document.getElementById(
            "product-code"
        ),

    category:
        document.getElementById(
            "product-category"
        ),

    name:
        document.getElementById(
            "product-name"
        ),

    description:
        document.getElementById(
            "product-description"
        ),

    price:
        document.getElementById(
            "product-price"
        ),

    stock:
        document.getElementById(
            "product-stock"
        ),

    criticalStock:
        document.getElementById(
            "product-critical-stock"
        ),

    image:
        document.getElementById(
            "product-image"
        )

};


const messages = {

    code:
        document.getElementById(
            "product-code-message"
        ),

    category:
        document.getElementById(
            "product-category-message"
        ),

    name:
        document.getElementById(
            "product-name-message"
        ),

    description:
        document.getElementById(
            "product-description-message"
        ),

    price:
        document.getElementById(
            "product-price-message"
        ),

    stock:
        document.getElementById(
            "product-stock-message"
        ),

    criticalStock:
        document.getElementById(
            "product-critical-stock-message"
        ),

    image:
        document.getElementById(
            "product-image-message"
        )

};


const statusElement =
    document.getElementById(
        "product-form-status"
    );


const descriptionCounter =
    document.getElementById(
        "description-counter"
    );


const stockWarning =
    document.getElementById(
        "product-stock-warning"
    );


/* =========================================================
   UTILIDADES
========================================================= */

function createSlug(value) {

    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================================================
   VALIDAR CÓDIGO
========================================================= */

function validateCode() {

    const value =
        fields.code.value
            .trim()
            .toUpperCase();


    fields.code.value =
        value;


    if (!value) {

        showFieldError(
            fields.code,
            messages.code,
            "El código del producto es obligatorio."
        );

        return false;

    }


    if (value.length < 3) {

        showFieldError(
            fields.code,
            messages.code,
            "El código debe tener al menos 3 caracteres."
        );

        return false;

    }


    const duplicated =
        getProducts().some(
            product => {

                return (
                    product.code
                        ?.toUpperCase()
                    ===
                    value
                )
                &&
                product.id !==
                    editingId;

            }
        );


    if (duplicated) {

        showFieldError(
            fields.code,
            messages.code,
            "Ya existe otro producto con este código."
        );

        return false;

    }


    showFieldSuccess(
        fields.code,
        messages.code
    );

    return true;

}


/* =========================================================
   CATEGORÍA
========================================================= */

function validateCategory() {

    if (!fields.category.value) {

        showFieldError(
            fields.category,
            messages.category,
            "Selecciona una categoría."
        );

        return false;

    }


    showFieldSuccess(
        fields.category,
        messages.category
    );

    return true;

}


/* =========================================================
   NOMBRE
========================================================= */

function validateName() {

    const value =
        fields.name.value
            .trim();


    if (!value) {

        showFieldError(
            fields.name,
            messages.name,
            "El nombre del producto es obligatorio."
        );

        return false;

    }


    if (value.length > 100) {

        showFieldError(
            fields.name,
            messages.name,
            "El nombre no puede superar 100 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        fields.name,
        messages.name
    );

    return true;

}


/* =========================================================
   DESCRIPCIÓN
========================================================= */

function validateDescription() {

    const value =
        fields.description.value;


    if (value.length > 500) {

        showFieldError(
            fields.description,
            messages.description,
            "La descripción no puede superar 500 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        fields.description,
        messages.description
    );

    return true;

}


/* =========================================================
   PRECIO
========================================================= */

function validatePrice() {

    const rawValue =
        fields.price.value;


    if (rawValue === "") {

        showFieldError(
            fields.price,
            messages.price,
            "El precio es obligatorio."
        );

        return false;

    }


    const value =
        Number(rawValue);


    if (
        Number.isNaN(value)
        ||
        value < 0
    ) {

        showFieldError(
            fields.price,
            messages.price,
            "El precio debe ser un número igual o superior a 0."
        );

        return false;

    }


    showFieldSuccess(
        fields.price,
        messages.price
    );

    return true;

}


/* =========================================================
   STOCK
========================================================= */

function validateStock() {

    const rawValue =
        fields.stock.value;


    if (rawValue === "") {

        showFieldError(
            fields.stock,
            messages.stock,
            "El stock es obligatorio."
        );

        return false;

    }


    const value =
        Number(rawValue);


    if (
        !Number.isInteger(value)
        ||
        value < 0
    ) {

        showFieldError(
            fields.stock,
            messages.stock,
            "El stock debe ser un número entero igual o superior a 0."
        );

        return false;

    }


    showFieldSuccess(
        fields.stock,
        messages.stock
    );

    return true;

}


/* =========================================================
   STOCK CRÍTICO
========================================================= */

function validateCriticalStock() {

    const rawValue =
        fields.criticalStock.value;


    if (rawValue === "") {

        fields.criticalStock
            .classList.remove(
                "is-invalid",
                "is-valid"
            );


        messages.criticalStock
            .textContent =
            "";


        return true;

    }


    const value =
        Number(rawValue);


    if (
        !Number.isInteger(value)
        ||
        value < 0
    ) {

        showFieldError(
            fields.criticalStock,
            messages.criticalStock,
            "El stock crítico debe ser un entero igual o superior a 0."
        );

        return false;

    }


    showFieldSuccess(
        fields.criticalStock,
        messages.criticalStock
    );

    return true;

}


/* =========================================================
   ALERTA STOCK CRÍTICO
========================================================= */

function updateStockWarning() {

    const stock =
        Number(
            fields.stock.value
        );


    const criticalRaw =
        fields.criticalStock.value;


    if (
        fields.stock.value === ""
        ||
        criticalRaw === ""
    ) {

        stockWarning.classList.add(
            "d-none"
        );

        return;

    }


    const critical =
        Number(
            criticalRaw
        );


    const shouldShow =
        Number.isInteger(stock)
        &&
        Number.isInteger(critical)
        &&
        stock >= 0
        &&
        critical >= 0
        &&
        stock <= critical;


    stockWarning.classList.toggle(
        "d-none",
        !shouldShow
    );

}


/* =========================================================
   CONTADOR DESCRIPCIÓN
========================================================= */

function updateDescriptionCounter() {

    descriptionCounter.textContent =
        `${fields.description.value.length} / 500`;

}


/* =========================================================
   VALIDAR FORMULARIO
========================================================= */

function validateForm() {

    const validations = [

        validateCode(),

        validateCategory(),

        validateName(),

        validateDescription(),

        validatePrice(),

        validateStock(),

        validateCriticalStock()

    ];


    return validations.every(
        Boolean
    );

}


/* =========================================================
   CARGAR PRODUCTO EXISTENTE
========================================================= */

function loadProduct() {

    if (!isEditing) {
        return;
    }


    const product =
        getProductById(
            editingId
        );


    if (!product) {

        statusElement.className =
            "form-status error";


        statusElement.textContent =
            "El producto solicitado no existe.";

        return;

    }


    document.getElementById(
        "product-form-title"
    ).textContent =
        "Editar producto";


    document.title =
        `Editar ${product.name} | KYNEX Admin`;


    fields.code.value =
        product.code || "";


    fields.category.value =
        product.category || "";


    fields.name.value =
        product.name || "";


    fields.description.value =
        product.description || "";


    fields.price.value =
        product.price ?? "";


    fields.stock.value =
        product.stock ?? "";


    fields.criticalStock.value =
        product.criticalStock
        ?? "";


    fields.image.value =
        product.image || "";


    updateDescriptionCounter();

    updateStockWarning();

}


/* =========================================================
   CONSTRUIR PRODUCTO
========================================================= */

function buildProductData(
    existingProduct = null
) {

    const name =
        fields.name.value
            .trim();


    const description =
        fields.description.value
            .trim();


    const criticalStock =
        fields.criticalStock.value === ""
            ? null
            : Number(
                fields.criticalStock.value
            );


    return {

        id:
            existingProduct?.id
            ??
            Date.now(),

        code:
            fields.code.value
                .trim()
                .toUpperCase(),

        name:
            name,

        slug:
            createSlug(name),

        category:
            fields.category.value,

        brand:
            existingProduct?.brand
            ??
            "KYNEX Nutrition",

        price:
            Number(
                fields.price.value
            ),

        stock:
            Number(
                fields.stock.value
            ),

        criticalStock:
            criticalStock,

        featured:
            existingProduct?.featured
            ??
            false,

        format:
            existingProduct?.format
            ??
            "Sin especificar",

        flavor:
            existingProduct?.flavor
            ??
            "Sin especificar",

        goals:
            existingProduct?.goals
            ??
            [],

        dietaryTags:
            existingProduct?.dietaryTags
            ??
            [],

        allergens:
            existingProduct?.allergens
            ??
            [],

        ingredients:
            existingProduct?.ingredients
            ??
            [],

        description:
            description,

        benefits:
            existingProduct?.benefits
            ??
            [],

        usage:
            existingProduct?.usage
            ??
            {

                serving:
                    "No especificado",

                preparation:
                    "No especificado",

                moment:
                    "No especificado"

            },

        nutrition:
            existingProduct?.nutrition
            ??
            {

                servingSize:
                    "No especificado",

                calories:
                    0,

                protein:
                    "0 g",

                carbohydrates:
                    "0 g",

                fats:
                    "0 g"

            },

        certifications:
            existingProduct?.certifications
            ??
            [],

        warning:
            existingProduct?.warning
            ??
            "Producto demostrativo. Revisar indicaciones y características antes de utilizar.",

        icon:
            existingProduct?.icon
            ??
            "bi-box-seam",

        image:
            fields.image.value
                .trim()

    };

}


/* =========================================================
   GUARDAR
========================================================= */

function saveProduct() {

    const products =
        getProducts();


    if (isEditing) {

        const index =
            products.findIndex(
                product =>
                    product.id ===
                    editingId
            );


        if (index === -1) {

            statusElement.className =
                "form-status error";


            statusElement.textContent =
                "No fue posible encontrar el producto a editar.";

            return;

        }


        products[index] =
            buildProductData(
                products[index]
            );

    } else {

        products.push(
            buildProductData()
        );

    }


    saveProducts(
        products
    );


    statusElement.className =
        "form-status success";


    statusElement.textContent =
        isEditing
            ? "Producto actualizado correctamente."
            : "Producto creado correctamente.";


    window.setTimeout(
        () => {

            window.location.href =
                "products.html";

        },
        700
    );

}


/* =========================================================
   EVENTOS
========================================================= */

fields.code.addEventListener(
    "blur",
    validateCode
);


fields.name.addEventListener(
    "blur",
    validateName
);


fields.category.addEventListener(
    "change",
    validateCategory
);


fields.description.addEventListener(
    "input",
    () => {

        updateDescriptionCounter();

        validateDescription();

    }
);


fields.price.addEventListener(
    "blur",
    validatePrice
);


fields.stock.addEventListener(
    "input",
    () => {

        updateStockWarning();

    }
);


fields.stock.addEventListener(
    "blur",
    validateStock
);


fields.criticalStock.addEventListener(
    "input",
    () => {

        updateStockWarning();

    }
);


fields.criticalStock.addEventListener(
    "blur",
    validateCriticalStock
);


/* =========================================================
   SUBMIT
========================================================= */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        statusElement.className =
            "form-status";


        if (!validateForm()) {

            statusElement.className =
                "form-status error";


            statusElement.textContent =
                "Revisa los campos marcados antes de guardar.";

            return;

        }


        saveProduct();

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

updateDescriptionCounter();

loadProduct();