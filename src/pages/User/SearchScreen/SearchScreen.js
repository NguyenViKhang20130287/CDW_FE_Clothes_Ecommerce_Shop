import React from "react";
import SearchComponent from "../../../components/SearchComponent/SearchComponent";
import {useLocation} from "react-router-dom";
import './SearchScreen.css'
const SearchScreen = () => {
    const location = useLocation();
    const keyword = location.state ? location.state.keyword : '';
    console.log('keyword', keyword)

    return (
        <div className={'collectionScreenContainer'}>
            <div className={'search-container'}>
                <div className={'collectionScreenWrapper'} style={{width:"100%", justifyContent: "center"}}>
                    <div className={'productShowWrapper'}>
                        <SearchComponent
                            keyword={keyword}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchScreen
