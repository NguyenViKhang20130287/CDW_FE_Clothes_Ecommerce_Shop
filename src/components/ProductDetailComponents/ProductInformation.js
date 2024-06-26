import React, {useEffect, useState} from "react";
import policy1 from "../../assets/img/ProductDetailSlider/Policy/product_poli_1.webp";
import policy2 from "../../assets/img/ProductDetailSlider/Policy/product_poli_3.webp";
import cup from "../../assets/img/ProductDetailSlider/Policy/cup.webp";
import {useDispatch} from "react-redux";
import toast from "react-hot-toast";
import APIService from "../../services/APIService";
import {useNavigate} from "react-router-dom";

const ColorSwatch = ({colors, selectedColor, setSelectedColor}) => {
    console.log("color", colors);
    return (
        <div className="swatch-color swatch clearfix">
            <div className="options-title">
                Màu sắc: <span className="var">{selectedColor}</span>
            </div>
            {colors.map((color, index) => (
                <div
                    key={index}
                    data-value={color.value}
                    className={`swatch-element color ${color.value.toLowerCase()} available`}
                >
                    <input
                        id={`swatch-0-${color.value.toLowerCase()}`}
                        type="radio"
                        name="color"
                        value={color.value}
                        checked={selectedColor === color.value}
                        onChange={() => setSelectedColor(color.value)}
                    />
                    <label
                        htmlFor={`swatch-0-${color.value.toLowerCase()}`}
                        title={color.value}
                        style={{
                            backgroundColor: color.code, // Set background color directly
                            width: '32px',
                            height: '32px',
                            display: 'block'
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

const SizeSwatch = ({sizes, selectedSize, setSelectedSize, selectedColor, product}) => {
    return (
        <div className="swatch clearfix" data-option-index="1">
            <div className="options-title">
                Kích thước: <span className="var">{selectedSize}</span>
            </div>
            {sizes.map((size, index) => (
                <div
                    key={index}
                    data-value={size.value}
                    className={`swatch-element ${size.value.toLowerCase()} available`}
                >
                    <input
                        id={`swatch-1-${size.value.toLowerCase()}`}
                        type="radio"
                        name="size"
                        value={size.value}
                        checked={selectedSize === size.value}
                        onChange={() => setSelectedSize(size.value)}
                        disabled={!size.available} // Disable if size is not available for selected color
                    />
                    <label
                        htmlFor={`swatch-1-${size.value.toLowerCase()}`}
                        title={size.value}
                        style={{opacity: size.available ? 1 : 0.5}} // Dim unavailable sizes
                    >
                        {size.value}
                    </label>
                </div>
            ))}
        </div>
    );
};


const ProductInformation = ({product}) => {
    const [currentColors, setCurrentColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedColorSize, setSelectedColorSize] = useState(null);
    const navigate = useNavigate()
    const colorSet = new Set();
    const fetchColors = async () => {
        const apiService = new APIService();
        try {
            const result = await apiService.fetchData(`/color`);
            const colorObject = result.content.reduce((obj, item) => {
                obj[item.name] = item.colorCode;
                return obj;
            }, {});
            setCurrentColors(colorObject);
            console.log("color", colorObject);
        } catch (error) {
            console.error('Error fetching colors', error);
        }
    }
    useEffect(() => {
        fetchColors();
    }, []);


    useEffect(() => {
        if (selectedColor) {
            const sizes = product.colorSizes
                .filter(item => item.color.name === selectedColor)
                .map(item => ({value: item.size.name, available: true}));
            setAvailableSizes(sizes);
            if (!sizes.find(size => size.value === selectedSize)) {
                setSelectedSize(sizes.length > 0 ? sizes[0].value : '');
            }
        }
    }, [selectedColor, selectedSize, product.colorSizes]);

    useEffect(() => {
        if (product.colorSizes && product.colorSizes.length > 0) {
            setSelectedColor(product.colorSizes[0].color.name);
        }
    }, [product.colorSizes]);


    const colors = product.colorSizes ? product.colorSizes.reduce((acc, item) => {
        if (!colorSet.has(item.color.name)) {
            colorSet.add(item.color.name);
            acc.push({
                value: item.color.name,
                code: currentColors[item.color.name]
            });
        }
        return acc;
    }, []) : [];


    useEffect(() => {
        if (product.colorSizes) {
            const colorSize = product.colorSizes.find(cs => cs.color.name === selectedColor && cs.size.name === selectedSize);
            if (colorSize) {
                setSelectedColorSize(colorSize);
            } else {
                setSelectedColorSize(null);
            }
        }
    }, [selectedColor, selectedSize, product.colorSizes]);

    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => {
        if (selectedColorSize && quantity < selectedColorSize.quantity) {
            setQuantity(prevQuantity => prevQuantity + 1);
        } else {
            console.log('Hết hàng');
            toast.error('Không đủ số lượng có sẵn!')
        }
    };

    const setSelectedColorAndResetQuantity = (color) => {
        setSelectedColor(color);
        setQuantity(1);
    };

    const setSelectedSizeAndResetQuantity = (size) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const dispatch = useDispatch();
    const addToCart = () => {
        dispatch({
            type: 'cart/add',
            payload: {
                product: product,
                selectedColor: selectedColor,
                selectedSize: selectedSize,
                quantity: quantity,
                selectedColorSize: selectedColorSize
            }
        });
        // toast.success("Sản phẩm đã được thêm vào giỏ hàng")
    };
    // const currentDate = new Date();

    let hasValidPromotion = false
        // product.promotions && product.promotions.length > 0 && new Date(product.promotions[0].startDate) <= currentDate && currentDate <= new Date(product.promotions[0].endDate);
    let discountedPrice = null
        // hasValidPromotion ? product.price - (product.price * product.promotions[0].discount_rate / 100) : product.price;
    const currentDate = new Date().toISOString().split('T')[0];
    let discountRate = 0
    if (product.promotions && product.promotions.length > 0) {
        const promotionActive = product.promotions.filter(pro => pro.status && !pro.deleted)
        let length = promotionActive.length
        console.log('Promotions active: ', promotionActive)
        const promotionNewest = promotionActive[length - 1]
        console.log('Promotion newest: ', promotionNewest)
        if (promotionActive.length > 0) {
            if (promotionNewest.endDate > currentDate && promotionNewest.startDate < currentDate) {
                console.log('Promotion Valid')
                hasValidPromotion = true
                discountedPrice = product.price - product.price * promotionNewest.discount_rate / 100;
                discountRate = promotionNewest.discount_rate
            }else {
                hasValidPromotion = false
            }
        } else {
            hasValidPromotion = false
        }
    }
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        currencyDisplay: 'narrowSymbol'
    });
    const formattedPrice = formatter.format(product.price).replace(/\s/g, '');
    const formattedDiscountedPrice = formatter.format(discountedPrice).replace(/\s/g, '');
    console.log('Status promotion: ', hasValidPromotion)
    console.log('FormattedPrice: ', formattedPrice)
    console.log('discount: ', formattedDiscountedPrice)

    const handleByNow = (product) => {
        // console.log('Item by Now: ', product)
        const productByNow = {
            ...product,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            quantity: quantity,
            selectedColorSize: selectedColorSize
        }
        localStorage.setItem("productByNow", JSON.stringify(productByNow))
        navigate('/order')
    }

    return (
        <div className="col-12 col-md-12 col-lg-4 details-pro">
            <div className="wrapright-content">
                <h1 className="title-head">{product.name}</h1>
            </div>
            <div className="group-power">
                <div className="inventory_quantity d-none">
                    <span className="a-stock a1">
                        <span className="a-stock">Còn hàng</span>
                    </span>
                </div>
                <div className="price-box clearfix">
                    {hasValidPromotion ?
                        <>
                        <span className="special-price">
                            <span className="price product-price">{formattedDiscountedPrice}</span>
                            </span>
                            <span className="old-price">
                            <del className="price product-price-old">{formattedPrice}</del>
                            </span>
                            <span className="save-price">-
                            <span
                                className="price product-price-save">-{discountRate}%</span>
                             </span>
                        </> :
                        <span className="special-price">
                            <span className="price product-price">{formattedPrice}</span>
                        </span>
                    }
                </div>

            </div>
            <div className="product-policy">
                <div className="item">
                    <img src={policy1} alt=""></img>Đổi trả dễ dàng
                </div>
                <div className="item">
                    <img src={policy1} alt=""></img>Chính hãng 100%
                </div>
                <div className="item">
                    <img src={policy2} alt=""></img>Giao toàn quốc
                </div>
            </div>
            <a href="" className="product-banchay">
                <b><img src={cup}
                        alt="Top bán chạy"/>Top bán chạy</b>
                <span>Sản phẩm bán chạy nhất</span>
            </a>
            <div className="product-summary rte">
                <p>Thông tin sản phẩm:<br/>
                    - Chất liệu:&nbsp;Birdseye<br/>
                    - Form: Oversize<br/>
                    - Màu sắc:&nbsp;Trắng/Đen<br/>
                    - Thiết kế: Thêu và in</p>
            </div>
            <form encType="multipart/form-data" id="add-to-cart-form" action=""
                  className="wishItem MultiFile-intercepted" method="post">
                <div className="form-product">
                    <div className="select-swatch">
                        <ColorSwatch
                            colors={colors}
                            selectedColor={selectedColor}
                            setSelectedColor={setSelectedColorAndResetQuantity}
                        />

                        <SizeSwatch
                            sizes={availableSizes}
                            selectedSize={selectedSize}
                            setSelectedSize={setSelectedSizeAndResetQuantity}
                            selectedColor={selectedColor}
                            product={product}
                        />
                        <div className="size-guide-box size-popup ">
                            + Hướng dẫn chọn size
                        </div>
                    </div>
                    <div className="clearfix from-action-addcart">
                        <div className="qty-ant clearfix custom-btn-number">
                            <div className="quantity-label-container">
                                <label>Số lượng</label>
                                {selectedColorSize &&
                                    <span
                                        className="color-size-quantity">({selectedColorSize.quantity} sản phẩm có sẵn)</span>}
                            </div>
                            <div className="custom custom-btn-numbers clearfix input_number_product">
                                <button
                                    className="btn-minus btn-cts"
                                    type="button"
                                    onClick={decreaseQuantity}
                                >–
                                </button>
                                <input
                                    aria-label="Số lượng: "
                                    type="text"
                                    className="qty input-text"
                                    id="qty"
                                    name="quantity"
                                    size="4"
                                    value={quantity}
                                    readOnly
                                />
                                <button
                                    className="btn-plus btn-cts"
                                    type="button"
                                    onClick={increaseQuantity}
                                >+
                                </button>

                            </div>
                            <div className="inventory_quantity">
                               <span className="a-stock">
                                    <span className="a-stock"
                                          style={{color: selectedColorSize && selectedColorSize.quantity > 0 ? 'black' : 'red'}}>
                                        {selectedColorSize && selectedColorSize.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="btn-mua"
                             style={{display: selectedColorSize && selectedColorSize.quantity > 0 ? 'block' : 'none'}}>
                            <button type="button"
                                    className="btn btn-lg btn-gray btn-cart btn_buy add_to_cart" onClick={addToCart}
                            >Thêm vào giỏ
                            </button>
                            <button type="button" className="btn btn-lg btn-gray btn_buy btn-buy-now"
                                    onClick={e => handleByNow(product)}>Mua ngay
                            </button>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}
export default ProductInformation;
