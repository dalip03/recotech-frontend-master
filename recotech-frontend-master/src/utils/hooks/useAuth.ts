import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import { fetchUserProfilePicture, fetchUsersWithToken } from '@/api/userService'
import { blobToBase64, parseJwt } from '../sharedHelpers'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)
    const user = useAppSelector((state) => state.auth.user)

    const signIn = async (
        values: SignInCredential
    ): Promise<
        | {
            status: Status
            message: string
        }
        | undefined
    > => {
        try {
            const resp = await apiSignIn(values)
            if (resp.data) {
                // console.log("Response " , resp.data)
                const { token } = resp.data
                dispatch(signInSuccess(token))
                localStorage.setItem('token', token);



                const userEmail = parseJwt(token).sub; // The user email embedded in the jwt
                const users = await fetchUsersWithToken(token);
                const user = users.find((user: any) => user.username === userEmail) ?? null;
               
                if (user.profilePictureKey) {
                    const file = await fetchUserProfilePicture(user.profilePictureKey, token).then(async (file: any) => await blobToBase64(file))
                    user.profilePicture = file
                }
                if (user) {
                    dispatch(
                        setUser(
                            {
                                id: user.id,
                                name: `${user.lastName} ${user.firstName}`,
                                username: user.username,
                                authority: user.role,
                                profilePicture: user.profilePicture,
                            }
                        )
                    )
                }

                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )

                return {
                    status: 'success',
                    message: '',
                };

                return {
                    status: 'success',
                    message: '',
                }
            }

        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp.data) {
                const { token } = resp.data
                dispatch(signInSuccess(token))
                if (resp.data.user) {
                    dispatch(
                        setUser(
                            {
                                id: '',
                                username: 'Anonymous',
                                name: 'Anonymous',
                                authority: '',
                            }
                        )
                    )
                }
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )
                return {
                    status: 'success',
                    message: '',
                }
            }

        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                id: '',
                username: '',
                name: '',
                authority: '',
            })
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        handleSignOut()
    }

    return {
        authenticated: token && signedIn && user,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
