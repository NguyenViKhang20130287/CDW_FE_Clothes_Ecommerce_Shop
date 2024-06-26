import React, {useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
// components
import './AccountDetailContentComponent.css'
import PopupAddress from "../PopupAddress/PopupAddress";
import RatingPopup from "./RatingPopup";

// img
import AVATAR_DEFAULT from '../../assets/img/user.png'
import PRODUCT from '../../assets/img/shirt1.webp'
// icons
import {FaEye, FaEyeSlash, FaPlus} from "react-icons/fa";
import {IoSearchSharp} from "react-icons/io5";
import {LiaShippingFastSolid} from "react-icons/lia";
// services
import APIService from "../../services/APIService";
import {TbLoader3} from "react-icons/tb";
import {LuLoader2} from "react-icons/lu";
import axios from "axios";
import {addLog} from "../../services/LogService";
import ApiService from "../../services/APIService";

const AccountDetailContentComponent = ({
                                           nameShow,
                                           user,
                                           updateUser,
                                       }) => {
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarLink, setAvatarLink] = useState('');
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [reNewPassword, setReNewPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [addresses, setAddresses] = useState([])
    const [isHiddenPopup, setIsHiddenPopup] = useState(true)
    const [showNamePopup, setShowNamePopup] = useState('')
    const [addressData, setAddressData] = useState(null)
    const [orders, setOrders] = useState([])
    const [searchInput, setSearchInput] = useState('')
    const [isLoaded, setIsLoaded] = useState(true)
    const [uploadAvatarLoaded, setupLoadAvatarLoaded] = useState(true)
    const childRef = useRef()
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const [openRatingPopup, setOpenRatingPopup] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [reloaded, setReloaded] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    const [cancelLoaded, setCancelLoaded] = useState(true)
    const [loadingOrderIds, setLoadingOrderIds] = useState([]);

    const handleChangeAvatar = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setupLoadAvatarLoaded(false)
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await
                    fetch('https://api.imgbb.com/1/upload?key=8c2c7c5c94797f04504f969ec51749a4',
                        {
                            method: 'POST',
                            body: formData
                        });

                const result = await response.json();
                if (result.success) {
                    setAvatarLink(result.data.url);
                    setTimeout(() => {
                        setupLoadAvatarLoaded(true)
                    }, 1000)
                } else {
                    console.error("Error uploading image to ImgBB", result);
                }
            } catch (error) {
                console.error("Error uploading image to ImgBB", error);
            }
        }
        console.log('AvatarLink: ', avatarLink)
    }

    const handleEditDataUser = async (e) => {
        e.preventDefault()
        console.log('Clicked')
        const userData = {
            username: user.username,
            fullName: fullName,
            email: email,
            phone: phone,
            avatarLink: avatarLink
        }
        // console.log('User data: ', userData)
        try {
            const res = await new APIService().updateData("/user/user-details/edit", userData);
            console.log('Response edit user: ', res)
            if (res.statusCodeValue === 400) {
                toast.error('Lỗi thao tác')
                return
            }
            toast.success('Thay đổi thông tin thành công')
            updateUser(res)
            await addLog(token, 'Thay đổi thông tin tài khoản')
        } catch (error) {
            console.log(error)
            await addLog(token, `Lỗi khi thay đổi thông tin tài khoản ${error.response.data}`)
        }
    }

    const handleAddNewAddress = async (e) => {
        e.preventDefault()
        const data = childRef.current.getData();
        console.log('Data from child:', data);
        // console.log(user.username)
        try {
            const res =
                await new APIService().sendData("/user/user-details/add-new-address",
                    data, {username: user.username})
            console.log('res: ', res)
            toast.success('Thêm địa chỉ thành công')
            setIsHiddenPopup(true)
            setAddresses(prevAddresses => [...prevAddresses, res]);
            // updateUser(prevUser => ({
            //     ...prevUser,
            //     addresses: [...prevUser.addresses, res]
            // }));
            setIsUpdated(!isUpdated)
            await addLog(token, 'Thêm địa chỉ mới')
        } catch (error) {
            console.log(error)
            toast.error('Lỗi thao tác !')
            await addLog(token, 'Lỗi thao tác khi thêm địa chỉ mới')
        }
    }

    const fetchAddressUser = async () => {
        try {
            console.log('Token: ', token)
            const res = await new APIService().fetchData('/user/user-details/addresses', null, {
                token: token
            })
            console.log('Response address: ', res)
            setAddresses(res.sort((a, b) => b.default - a.default))
        } catch (e) {
            console.log('Err fetching data address: ', e)
        }
    }

    useEffect(() => {
        fetchAddressUser()
    }, [isUpdated]);

    const handleEditAddress = async (e) => {
        e.preventDefault()
        const data = childRef.current.getData();
        console.log('Data from child edit:', data);
        try {
            const res =
                await new APIService().sendData("/user/user-details/edit-address",
                    data, {username: user.username})
            console.log('res: ', res)
            toast.success('Cập nhật địa chỉ thành công')
            setIsHiddenPopup(true)
            setIsUpdated(!isUpdated)
            await addLog(token, 'Cập nhật địa chỉ')
        } catch (error) {
            console.log(error)
            toast.error('Lỗi thao tác !')
            await addLog(token, 'Lỗi thao tác cập nhật địa chỉ')
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        const userData = {
            username: username,
            password: oldPassword,
            newPassword: newPassword
        }

        if (reNewPassword !== newPassword) {
            toast.error('Mật khẩu nhập lại không chính xác !')
            return
        }
        try {
            const res =
                await new APIService().sendData("/user/user-details/change-password", userData)
            // console.log('res: ', res)
            toast.success(res)
            setOldPassword('')
            setNewPassword('')
            setReNewPassword('')
            await addLog(token, 'Thay đổi mật khẩu')
        } catch (error) {
            toast.error(error.response.data)
            await addLog(token, `Lỗi khi thay đổi mật khẩu ${error.response.data}`)
            console.log(error)
        }
    }

    const handleShowPopup = (showNamePopup, address) => {
        setShowNamePopup(showNamePopup)
        setIsHiddenPopup(false)
        if (showNamePopup === 'update') {
            setAddressData(address)
        }
    }

    const handleOnClickHiddenPopup = (e) => {
        e.preventDefault()
        setIsHiddenPopup(true)
        setShowNamePopup('')
        setAddressData(null)
    }

    const formattedPrice = (price) => {
        return price.toLocaleString('vi-VN') + 'đ';
    }
    const fetchDataOrdersUser = async () => {
        if (token !== null) {
            try {
                const res = await new APIService().fetchData("/order/find-by-user", null, {token: token})
                // console.log(res)
                setOrders(res)
                localStorage.setItem('user_id', orders[0].user_id)
            } catch (e) {
                console.log(e)
            }
        }
    }

    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const handleSearchOrder = () => {
        const results = orders.filter((order) => {
                return (
                    order.id.toString() === searchInput ||
                    order.orderDetails.some((detail) =>
                        removeDiacritics(detail.product_name.toLowerCase()).includes(removeDiacritics(searchInput.toLowerCase()))
                    )
                );
            }
        )
        setOrders(results)
    }

    useEffect(() => {
        setIsLoaded(false)
        setTimeout(async () => {
            if (searchInput === '') {
                await fetchDataOrdersUser();
            } else {
                if (orders.length === 0)
                    await fetchDataOrdersUser();
                handleSearchOrder()
            }
            setIsLoaded(true)
        }, 1000)

        console.log(removeDiacritics(searchInput))
    }, [searchInput]);

    useEffect(() => {
        if (user) {
            setUsername(user.username)
            setFullName(user.userInformation.fullName);
            setEmail(user.userInformation.email);
            setPhone(user.userInformation.phone);
            setAvatarLink(user.userInformation.avatar);
            // setAddresses([...user.addresses].sort((a, b) => b.default - a.default))
        }
    }, [isHiddenPopup, reloaded]);

    useEffect(() => {
        fetchDataOrdersUser()
    }, [token]);

    const handleSetDefaultAddress = async (id) => {
        // console.log('Address id: ', id)
        try {
            const res = await axios.post("https://teelab-be.up.railway.app/api/v1/user/user-details/address/set-default",
                null, {
                    params: {
                        userId: user.id,
                        addressId: id
                    }
                })
            // console.log('Res set default: ', res)
            setIsUpdated(!isUpdated)
        } catch (e) {
            console.log(e)
        }
    }

    const handleOpenRatingPopup = (detail) => {
        setSelectedDetail(detail);
        setOpenRatingPopup(true);
    };

    const handleCloseRatingPopup = () => {
        setOpenRatingPopup(false);
        setSelectedDetail(null);
    };

    const handleNavigateTracking = (item) => {
        // console.log('Item: ', item)
        navigate(`/order-tracking/${item.id}`)
    }

    const handleCancelOrder = async (orderId) => {
        console.log('Order id: ', orderId)
        setLoadingOrderIds(prev => [...prev, orderId]);
        // setCancelLoaded(false)
        const data = {
            "orderId": orderId,
            'status': "Canceled"
        }
        try {
            const res = await new ApiService().sendData("/order/update-status", data)
            console.log('Response updated status: ', res)
            setLoadingOrderIds(prev => prev.filter(id => id !== orderId));
            // setCancelLoaded(true)
            setIsUpdated(!isUpdated)
            toast.success('Hủy đơn hàng thành công')
        } catch (e) {
            console.log(e)
            toast.error('Lỗi thao tác')
        }
    }

    useEffect(() => {
        fetchDataOrdersUser()
        console.log('Fetch order...')
    }, [isUpdated]);

    // useEffect(() => {
    //     if (nameShow !== 'update'){
    //         setFullName('')
    //         setPhone('')
    //
    //     }
    // }, [nameShow]);

    return (
        <div className={'accountDetailContentWrapper'}>
            {nameShow === 'profile' &&
                <div className={'profileContainer'}>
                    <div className={'title'}>
                        <h3>Hồ sơ của tôi</h3>
                        <span>Quản lý thông tin hồ sơ để bảo mật tài khoản</span>
                    </div>
                    <div className={'profileWrapper'}>
                        <form className={'editForm'}>
                            <div className={'editControl username'}>
                                <label htmlFor={'username'}>Tên đăng nhập</label>
                                <input value={user.username}
                                       type={"text"}
                                       id={'username'}
                                       disabled={true}
                                />
                            </div>
                            <div className={'editControl fullName'}>
                                <label htmlFor={'fullName'}>Họ và tên</label>
                                <input
                                    value={fullName ? fullName : ''}
                                    type={"text"}
                                    id={'fullName'}
                                    onChange={event => setFullName(event.target.value)}
                                />
                            </div>
                            <div className={'editControl'}>
                                <label htmlFor={'email'}>Email</label>
                                <input
                                    value={email}
                                    type={"email"}
                                    id={'email'}
                                    // disabled={true}
                                    onChange={event => setEmail(event.target.value)}
                                />
                            </div>
                            <div className={'editControl'}>
                                <label htmlFor={'phone'}>Số điện thoại</label>
                                <input
                                    value={phone ? phone : ''}
                                    type={"tel"}
                                    id={'phone'}
                                    onChange={event => setPhone(event.target.value)}
                                />
                            </div>
                            <button className={'saveBtn'} type={"submit"}
                                    onClick={e => handleEditDataUser(e)}>
                                Lưu
                            </button>
                        </form>
                        <div className={'editAvatarWrapper'}>
                            <form className={'editAvatar'}>
                                <div className={'avatarWrapper'}>
                                    <img src={avatarLink ? avatarLink : AVATAR_DEFAULT} alt={''}/>
                                    <div className={'uploadAvatarLoading'} hidden={uploadAvatarLoaded}>
                                        <TbLoader3 className={'icon'}/>
                                    </div>
                                </div>
                                <input
                                    className={'uploadImage'}
                                    type={"file"}
                                    id={'uploadImage'}
                                    accept={'image/*'}
                                    onChange={e => handleChangeAvatar(e)}
                                />
                                <label htmlFor={'uploadImage'}>Chọn ảnh</label>
                            </form>
                        </div>
                    </div>
                </div>
            }
            {nameShow === 'address' &&
                <div className={'addressContainer'}>
                    <div className={'title headerAddress'}>
                        <h3>Địa chỉ của tôi</h3>
                        <button className={'addAddressBtn'}
                            // onClick={handleShowPopup}
                        >
                            <FaPlus/>
                            <span onClick={e => handleShowPopup('add')}>
                                    Thêm địa chỉ mới
                                </span>
                        </button>
                    </div>
                    <div className={'addressListWrapper'}>
                        <div className={'addressList'}
                             style={{
                                 overflowY: 'scroll',
                                 height: '400px'
                             }}
                        >
                            {addresses.length > 0 ?
                                addresses.map((address, index) => (
                                    <div className={'addressItem'} key={address.id}>
                                        <div className={'addressInfo'}>
                                            <div className={'fullNamePhone'}>
                                                <h3>{address.fullName ? address.fullName : ''}</h3>
                                                <h3>{address.phone ? address.phone : ''}</h3>
                                            </div>
                                            <div className={'address'}>
                                        <span className={'street'}>
                                            {address.street}
                                        </span>
                                                <span className={'detail'}>
                                            {
                                                address.ward + ', '
                                                + address.district + ', '
                                                + address.province
                                            }
                                        </span>
                                            </div>
                                        </div>
                                        <div className={'addressAction'}>
                                            <button
                                                className={'updateAddress'}
                                                type={'button'}
                                                onClick={e => handleShowPopup('update', address)}
                                            >Cập nhật
                                            </button>

                                            {address.default ?
                                                <button className={'setDefaultAddress defaulted'} disabled={true}
                                                >
                                                    Thiết lập mặc định
                                                </button>
                                                :
                                                <button className={'setDefaultAddress'}
                                                        onClick={e => handleSetDefaultAddress(address.id)}
                                                >Thiết lập mặc định</button>

                                            }
                                        </div>
                                    </div>
                                ))
                                :
                                <div style={
                                    {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }
                                }>
                                    <span>Chưa có địa chỉ nào...</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            {nameShow === 'changePassword' &&
                <div className={'changePasswordContainer'}>
                    <div className={'title headerAddress'}>
                        <h3>Đổi mật khẩu</h3>
                        <span>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</span>
                    </div>
                    <div className={'changePasswordWrapper'}>
                        <form action="">
                            <div className={'passwordControl'}>
                                <label htmlFor={'oldPassword'}>Mật khẩu cũ</label>
                                <div className={'inputWrapper'}>
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        id={'oldPassword'}
                                        value={oldPassword}
                                        onChange={e => setOldPassword(e.target.value.trim())}/>
                                    {oldPassword.trim().length > 0 &&
                                        <button className={'showBtn'}
                                                type={'button'}
                                                onClick={() => setShowOldPassword(!showOldPassword)}>
                                            {!showOldPassword ? <FaEye/> : <FaEyeSlash/>}
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className={'passwordControl'}>
                                <label htmlFor={'newPassword'}>Mật khẩu mới</label>
                                <div className={'inputWrapper'}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id={'newPassword'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value.trim())}/>
                                    {newPassword.trim().length > 0 &&
                                        <button className={'showBtn'}
                                                type={'button'}
                                                onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {!showNewPassword ? <FaEye/> : <FaEyeSlash/>}
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className={'passwordControl'}>
                                <label htmlFor={'newPassword'}>Nhập lại mật khẩu mới</label>
                                <div className={'inputWrapper'}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id={'reNewPassword'}
                                        value={reNewPassword}
                                        onChange={e => setReNewPassword(e.target.value.trim())}/>
                                    {reNewPassword.trim().length > 0 &&
                                        <button className={'showBtn'}
                                                type={'button'}
                                                onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {!showNewPassword ? <FaEye/> : <FaEyeSlash/>}
                                        </button>
                                    }
                                </div>
                            </div>

                            <button className={'changePassBtn'}
                                    onClick={e => handleChangePassword(e)}
                            >
                                Đổi Mật Khẩu
                            </button>

                        </form>
                    </div>

                </div>
            }
            {nameShow === 'purchaseOrder' &&
                <div className={'purchaseOrderContainer'}>
                    {/*<div className={'listStatusWrapper'}>*/}
                    {/*    <button className={'statusBtn active'}>Tất cả</button>*/}
                    {/*    <button className={'statusBtn'}>Chờ thanh toán</button>*/}
                    {/*    <button className={'statusBtn'}>Vận chuyển</button>*/}
                    {/*    <button className={'statusBtn'}>Chờ giao hàng</button>*/}
                    {/*    <button className={'statusBtn'}>Hoàn thành</button>*/}
                    {/*    <button className={'statusBtn'}>Đã hủy</button>*/}
                    {/*    <button className={'statusBtn'}>Trả hàng/Hoàn tiền</button>*/}
                    {/*</div>*/}
                    <div className={'searchOrderContainer'}>
                        <div className={'searchOrderWrapper'}>
                            <IoSearchSharp size={'20'} color={'#999999'}/>
                            <input
                                type="text"
                                placeholder={'Bạn có thể tìm kiếm theo ID hoặc Tên Sản Phẩm'}
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={'orderUserContainer'}>
                        <div className={'orderLoader'} hidden={isLoaded}>
                            <TbLoader3 className={'icon'}/>
                        </div>
                        {orders && orders.length > 0 ?
                            orders.map(item => {
                                const details = item.orderDetails
                                return (
                                    <div className={'orderUserWrapper'} key={item.id}>
                                        <div className={'orderHeader'}>
                                            <span className={'orderId'}>Mã đơn hàng: {item.id}</span>
                                            <div className={'orderStatus'}>
                                                <span
                                                    style={item.deliveryStatusHistories[item.deliveryStatusHistories.length - 1].deliveryStatus.name === 'Canceled' ?
                                                        {color: 'red'} : {color: '#26aa99'}
                                                    }
                                                >{item.deliveryStatusHistories[item.deliveryStatusHistories.length - 1].deliveryStatus.description}</span>
                                            </div>
                                        </div>
                                        <div className={'orderProducts'}>
                                            {details.length > 0 &&
                                                details.map(de => {
                                                    return (
                                                        <div className={'orderProduct'} key={de.id}>
                                                            <div className={'info'}>
                                                                <div className={'imgWrapper'}>
                                                                    <img src={de.product.thumbnail} alt={""}/>
                                                                </div>
                                                                <div className={'contentWrapper'}>
                                                                    <span
                                                                        className={'nameProduct'}>{de.product_name}</span>
                                                                    <span
                                                                        className={'colorSize'}>{de.color.name}, {de.size.name}, x{de.quantity}</span>
                                                                    <div className={'price'}>
                                                                        {/*<span className={'oldPrice'}>350.000đ</span>*/}
                                                                        <span
                                                                            className={'newPrice'}>{formattedPrice(de.price)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={'ratingButtonContainer'}>
                                                                <button className={'ratingButton'}
                                                                        hidden={!(item.deliveryStatus.name === 'Delivered')}
                                                                        onClick={() => handleOpenRatingPopup(de)}>Đánh
                                                                    giá
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div className={'action'}>
                                            <button className={'orderDetailBtn'} type={'button'}
                                                    onClick={e => handleNavigateTracking(item)}
                                            >Chi tiết
                                            </button>
                                            <button className={'cancelOrder'} type="button"
                                                    onClick={e => handleCancelOrder(item.id)}
                                                    disabled={item.deliveryStatusHistories[item.deliveryStatusHistories.length - 1].deliveryStatus.name === 'Canceled' ||
                                                        item.deliveryStatusHistories[item.deliveryStatusHistories.length - 1].deliveryStatus.name === 'OutforDelivery' ||
                                                        item.deliveryStatusHistories[item.deliveryStatusHistories.length - 1].deliveryStatus.name === 'Delivered'}
                                            >
                                                <div className={'cancelLoader'}
                                                     hidden={!loadingOrderIds.includes(item.id)}>
                                                    <TbLoader3 className={'icon'}/>
                                                </div>
                                                <span hidden={loadingOrderIds.includes(item.id)}>Hủy đơn hàng</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                            :
                            <div className={'orderUserWrapper'}>
                                <span>Chưa có đơn hàng nào</span>
                            </div>
                        }


                    </div>

                </div>
            }
            <RatingPopup
                open={openRatingPopup}
                handleClose={handleCloseRatingPopup}
                detail={selectedDetail}
                user={user}
            />
            <PopupAddress
                showNamePopup={showNamePopup}
                addressData={addressData}
                title={showNamePopup === 'add' ? 'Thêm địa chỉ mới' : 'Cập nhật địa chỉ'}
                isHiddenPopup={isHiddenPopup}
                onClickHiddenPopup={e => handleOnClickHiddenPopup(e)}
                handleSubmit={e => handleAddNewAddress(e)}
                handleEditAddress={e => handleEditAddress(e)}
                ref={childRef}
            />
        </div>
    )
}
export default AccountDetailContentComponent
