import { t } from 'i18next'
import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">{t("Welcome back!")}</h3>
                <p>{t("Please enter your credentials to sign in!")}</p>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
