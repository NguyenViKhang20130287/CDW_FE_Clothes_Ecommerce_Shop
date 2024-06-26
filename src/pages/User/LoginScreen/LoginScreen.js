import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {Link, useNavigate} from "react-router-dom";
// services
import ApiService from '../../../services/APIService'
// icons
import {CiUser, CiLock} from "react-icons/ci";
import {FaEye, FaGoogle, FaFacebookF, FaEyeSlash} from "react-icons/fa";
// css
import './LoginScreen.css'
import './Responsive.css'
import {TbLoader3} from "react-icons/tb";

const LoginScreen = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [errorColor, setErrorColor] = useState('var(--color-silver)')
    const [isLoaded, setIsLoaded] = useState(true)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        setIsLoaded(false)
        e.preventDefault()
        if (password.length < 6) {
            setIsLoaded(true)
            setErrorColor('red')
            toast.error('Mật khẩu phải dài hơn 6 kí tự')
            return
        }
        try {
            const userData = {
                username: username,
                password: password
            }
            // console.log('User data: ', userData)
            const res = await new ApiService().sendData("/auth/login", userData)
            console.log('Login Data: ', res)
            if (res.statusCodeValue === 200) {
                localStorage.setItem("token", res.body.token)
                toast.success('Đăng nhập thành công', {
                    onClose: () => {
                        setTimeout(() => {
                            navigate('/');
                        }, 10000);
                    }
                });
                setIsLoaded(true)
                navigate('/');
            } else {
                toast.error(res.body)
                setIsLoaded(true)
            }
        } catch (error) {
            console.log(error)
        }
        // console.log('clicked')
    }

    useEffect(() => {
        setErrorColor('var(--color-silver)')
    }, [password]);

    return (
        <div className={'loginContainer'}>
            <div className={'loginWrapper'}>
                <div className={'loginBox'}>
                    <h3 className={'title'}>ĐĂNG NHẬP</h3>
                    <form className={'formGroup'}>
                        <div className={'emailUsername'}>
                            <CiUser/>
                            <input
                                placeholder={'Nhập email hoặc username'}
                                type={'text'}
                                onChange={e => setUsername(e.target.value)}
                                value={username}
                            />
                        </div>
                        <div className={'password'}
                             style={{
                                 borderColor: errorColor
                             }}
                        >
                            <CiLock/>
                            <input placeholder={'Nhập mật khẩu'}
                                   type={isShowPassword ? 'text' : 'password'}
                                   value={password}
                                   onChange={event => setPassword(event.target.value)}/>
                            <button type={'button'} className={'eye'}
                                    onClick={event => setIsShowPassword(!isShowPassword)}>
                                {password.length > 0 ?
                                    (isShowPassword ? <FaEyeSlash/> : <FaEye/>)
                                    : ''
                                }
                                {/*{password.length > 0 ? typePassword === 'password' ? <FaEye/> : <FaEyeSlash/> : ''}*/}
                            </button>
                        </div>
                        <button type={'submit'}
                                className={'loginBtn'}
                                onClick={e => handleLogin(e)}
                        >
                            <span hidden={!isLoaded}>ĐĂNG NHẬP</span>
                            <div className={'loginLoader'} hidden={isLoaded}>
                                <TbLoader3 className={'icon'}/>
                            </div>
                        </button>
                    </form>
                    <div className={'otherOptions'}>
                        <div className={'register-forgot-wrapper'}>
                            <Link to={'/register'} className={'register'}>
                                Đăng kí
                            </Link>
                            <Link to={'/forgot-password'} className={'forgotPassword'}>
                                Quên mật khẩu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginScreen
