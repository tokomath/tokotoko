import { use } from "react"
import { SignIn } from '@clerk/nextjs'

const SignInPage = ({ params }: { params: Promise<{ redirect_url: string }> }) => {
  const {redirect_url} = use(params);
  return (
    <div className="w-full mt-4 flex justify-center items-center">
      <SignIn fallbackRedirectUrl={redirect_url ? redirect_url : "mypage"} />
    </div>
  )
}

export default SignInPage