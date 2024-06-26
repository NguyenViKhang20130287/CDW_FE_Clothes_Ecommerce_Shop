import toast from "react-hot-toast";

const persistedCart = localStorage.getItem('cart');
const persistedViewed = localStorage.getItem('recentlyViewed');
const initState = {
    viewed: persistedViewed ? JSON.parse(persistedViewed) : [],
    products: [],
    cart: persistedCart ? JSON.parse(persistedCart) : []
}
export const root = (state = initState, action) => {
    switch (action.type) {
        case "product/load": {
            return {
                ...state,
                products: action.payload
            }
        }
        case "cart/load": {
            return {
                ...state,
                cart: action.payload
            }
        }
        case "cart/add": {
            const { product, selectedColor, selectedSize, quantity, selectedColorSize } = action.payload;
            const existingProductIndex = state.cart.findIndex(cartItem =>
                cartItem.product.id === product.id &&
                cartItem.selectedColor === selectedColor &&
                cartItem.selectedSize === selectedSize
            );
            if (existingProductIndex !== -1) {
                // Product with the same color and size is already in the cart, update the quantity
                const newCart = [...state.cart];
                const existingProduct = newCart[existingProductIndex];
                if (selectedColorSize && existingProduct.quantity + quantity > selectedColorSize.quantity) {
                    toast.error("Sản phẩm đã có trong giỏ hàng, không thể thêm nhiều hơn")
                    return state;
                }
                const updatedProduct = {
                    ...existingProduct,
                    quantity: existingProduct.quantity + quantity
                };

                toast.success("Sản phẩm đã được thêm vào giỏ hàng")
                newCart[existingProductIndex] = updatedProduct;
                localStorage.setItem('cart', JSON.stringify(newCart));
                return {
                    ...state,
                    cart: newCart
                };
            } else {
                // Product is not in the cart, add it
                if (selectedColorSize && quantity > selectedColorSize.quantity) {
                    toast.error("Sản phẩm đã có trong giỏ hàng, không thể thêm nhiều hơn")
                    return state;
                }
                const newCart = [...state.cart, action.payload];
                toast.success("Sản phẩm đã được thêm vào giỏ hàng")
                localStorage.setItem('cart', JSON.stringify(newCart));
                return {
                    ...state,
                    cart: newCart
                };
            }
        }

        case "colorSize/updateStock": {
            const { product, selectedColor, selectedSize, quantity } = action.payload;
            const existingProductIndex = state.products.findIndex(prod => prod.id === product.id);
            if (existingProductIndex !== -1) {
                const newProducts = [...state.products];
                const existingProduct = newProducts[existingProductIndex];
                const existingColorSizeIndex = existingProduct.colorSizes.findIndex(colorSize =>
                    colorSize.color.name === selectedColor && colorSize.size.name === selectedSize
                );
                if (existingColorSizeIndex !== -1) {
                    const updatedColorSize = {
                        ...existingProduct.colorSizes[existingColorSizeIndex],
                        quantity: existingProduct.colorSizes[existingColorSizeIndex].quantity - quantity
                    };
                    const updatedProduct = {
                        ...existingProduct,
                        colorSizes: [
                            ...existingProduct.colorSizes.slice(0, existingColorSizeIndex),
                            updatedColorSize,
                            ...existingProduct.colorSizes.slice(existingColorSizeIndex + 1)
                        ]
                    };
                    newProducts[existingProductIndex] = updatedProduct;
                    return {
                        ...state,
                        products: newProducts
                    };
                }
            }
            return state;
        }
        case "cart/increaseQuantity": {
            const { product, selectedColor, selectedSize, selectedColorSize } = action.payload;
            const existingProductIndex = state.cart.findIndex(cartItem =>
                cartItem.product.id === product.id &&
                cartItem.selectedColor === selectedColor &&
                cartItem.selectedSize === selectedSize
            );
            if (existingProductIndex !== -1) {
                const newCart = [...state.cart];
                const existingProduct = newCart[existingProductIndex];
                if (existingProduct.quantity + 1 > selectedColorSize.quantity) {
                    console.log("Khong the them");
                } else {
                    const updatedProduct = {
                        ...existingProduct,
                        quantity: existingProduct.quantity + 1
                    };
                    newCart[existingProductIndex] = updatedProduct;
                    localStorage.setItem('cart', JSON.stringify(newCart));
                    return {
                        ...state,
                        cart: newCart
                    };
                }
            }
            return state;
        }
        case "cart/decreaseQuantity": {
            const { product, selectedColor, selectedSize } = action.payload;
            const existingProductIndex = state.cart.findIndex(cartItem =>
                cartItem.product.id === product.id &&
                cartItem.selectedColor === selectedColor &&
                cartItem.selectedSize === selectedSize
            );
            if (existingProductIndex !== -1) {
                const newCart = [...state.cart];
                const existingProduct = newCart[existingProductIndex];
                if (existingProduct.quantity > 1) {
                    const updatedProduct = {
                        ...existingProduct,
                        quantity: existingProduct.quantity - 1
                    };
                    newCart[existingProductIndex] = updatedProduct;
                    localStorage.setItem('cart', JSON.stringify(newCart));
                    return {
                        ...state,
                        cart: newCart
                    };
                }
            }
            return state;
        }
        case "cart/delete": {
            const { product, selectedColor, selectedSize } = action.payload;
            const existingProductIndex = state.cart.findIndex(cartItem =>
                cartItem.product.id === product.id &&
                cartItem.selectedColor === selectedColor &&
                cartItem.selectedSize === selectedSize
            );
            if (existingProductIndex !== -1) {
                const newCart = [...state.cart];
                newCart.splice(existingProductIndex, 1);
                localStorage.setItem('cart', JSON.stringify(newCart));
                return {
                    ...state,
                    cart: newCart
                };
            }
            return state;
        }
        case "cart/clear": {
            localStorage.removeItem('cart');
            return {
                ...state,
                cart: []
            };
        }
        case 'recent/add': {
            const existingProductIndex = state.viewed.findIndex(product => product.id === action.payload.id);
            let updatedViewed;
            if (existingProductIndex !== -1) {
                // If the product already exists in the viewed list, remove it
                updatedViewed = state.viewed.filter((_, index) => index !== existingProductIndex);
            } else {
                updatedViewed = [...state.viewed];
            }
            // Add the new product at the start of the viewed list
            updatedViewed.unshift(action.payload);
            localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
            return {
                ...state,
                viewed: updatedViewed
            }
        }
        default:
            return state;
    }
}
