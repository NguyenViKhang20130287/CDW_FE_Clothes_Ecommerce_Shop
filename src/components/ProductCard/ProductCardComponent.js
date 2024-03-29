import React from "react";
import './ProductCardComponent.css'

const ProductCardComponent = ({image, name, price, originPrice}) => {
    return (
        <div className={'productCardItem'}>
            <div className={'itemImage'}>
                <img src={image} alt={''}/>
            </div>
            <div className={'itemName'}>
                <span>{name}</span>
            </div>
            <div className={'itemPrice'}>
                <span className={'price'}>{price}đ</span>
                <span className={'originPrice'}>{originPrice}đ</span>
            </div>
        </div>
    )
}

export default ProductCardComponent