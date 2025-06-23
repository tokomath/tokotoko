import { SignIn } from '@clerk/nextjs'

const SignInPage = ({ params }: { params: { redirect_url: string } }) => {
  return (
    <div className="w-full mt-4 flex justify-center items-center">
      <SignIn fallbackRedirectUrl={params.redirect_url} />
    </div>
  )
}

export default SignInPage