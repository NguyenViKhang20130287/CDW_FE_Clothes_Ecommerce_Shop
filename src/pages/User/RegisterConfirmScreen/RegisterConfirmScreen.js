import React, {useEffect, useState} from "react";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import {CiLock, CiUser, CiMail} from "react-icons/ci";
import toast from "react-hot-toast";
// components
import './RegisterConfirmScreen.css'
import './Responsive.css'
// services
import ApiService from "../../../services/APIService";
import {TbLoader3} from "react-icons/tb";

const RegisterConfirmScreen = () => {
    const [username, setUserName] = useState("")
    const [typePassword, setTypePassword] = useState('password')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [isLoaded, setIsLoaded] = useState(true)
    const [otp, setOtp] = useState('')
    const navigate = useNavigate()


    const handleShowHidePassword = (e) => {
        e.preventDefault()
        if (typePassword === 'password') {
            setTypePassword('text')
        } else {
            setTypePassword('password')
        }
    }

    const handleRegisterConfirm = async (e) => {
        e.preventDefault()
        setIsLoaded(false)
        if (rePassword !== password) {
            toast.error('Mật khẩu không trùng khớp, vui lòng nhập lại !')
            return
        }
        if (username.length < 8) {
            toast.error('Username phải dài hơn 8 kí tự !')
            return
        }
        if (password.length < 6) {
            toast.error('Mật khẩu phải dài hơn 6 kí tự !')
            return
        }
        const userData = {
            email: localStorage.getItem('emailRegistered'),
            username: username,
            password: password,
            otp: otp
        }
        // console.log('Data user: ', userData)
        try {
            const res = await new ApiService().sendData("/auth/register/confirm", userData)
            if (res.statusCodeValue === 200) {
                toast.success('Đăng kí tài khoản thành công', {
                    onClose: () => {
                        setTimeout(() => {
                            navigate('/login');
                        }, 10000);
                    }
                });
                setIsLoaded(true)
                navigate('/login');
            } else {
                toast.error(res.body)
                // setMessage(res.body)
                setIsLoaded(true)
            }
            console.log('Data register confirm: ', res)
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {

    }, [username, password, rePassword, otp])

    return (
        <div className={'registerConfirmContainer'}>
            <div className={'registerConfirmWrapper'}>
                <div className={'registerConfirmBox'}>
                    <h3 className={'title'}>XÁC NHẬN ĐĂNG KÍ</h3>

                    <form className={'formGroup'}>
                        <div className={'username'}>
                            <CiUser/>
                            <input placeholder={'Nhập username'}
                                   type={'text'}
                                   onChange={e => setUserName(e.target.value)}
                                   value={username}
                            />
                        </div>
                        <div className={'password'}>
                            <CiLock/>
                            <input placeholder={'Nhập mật khẩu'} type={typePassword}
                                   value={password}
                                   onChange={event => setPassword(event.target.value)}/>
                            <button type={'button'} className={'eye'}
                                    onClick={event => handleShowHidePassword(event)}>
                                {password.length > 0 ? typePassword === 'password' ? <FaEye/> : <FaEyeSlash/> : ''}
                            </button>
                        </div>

                        <div className={'password'}>
                            <CiLock/>
                            <input placeholder={'Nhập lại mật khẩu'} type={typePassword}
                                   value={rePassword}
                                   onChange={event => setRePassword(event.target.value)}
                            />
                            <button type={'button'} className={'eye'}
                                    onClick={event => handleShowHidePassword(event)}>
                                {password.length > 0 ? typePassword === 'password' ? <FaEye/> : <FaEyeSlash/> : ''}
                            </button>
                        </div>

                        <div className={'otp'}>
                            <CiMail/>
                            <input placeholder={'Nhập OTP'}
                                   type={"text"}
                                   onChange={e => setOtp(e.target.value)}
                                   value={otp}
                            />
                        </div>
                        <button type={'submit'}
                                className={'registerConfirmBtn'}
                                onClick={e => handleRegisterConfirm(e)}
                        >
                            <span hidden={!isLoaded}>ĐĂNG KÍ</span>
                            <div className={'loginLoader'} hidden={isLoaded}>
                                <TbLoader3 className={'icon'}/>
                            </div>
                        </button>
                    </form>
                    <div className={'loginOptionWrapper'}>
                        <Link to={'/login'} className={'login'}>
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RegisterConfirmScreen
